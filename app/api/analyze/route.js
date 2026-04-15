export async function POST(request) {
  try {
    const { images, address } = await request.json();

    if (!images || images.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    // Fetch each image and convert to base64
    const imageContents = [];

    for (const img of images) {
      try {
        const imageRes = await fetch(img.url);
        if (!imageRes.ok) continue;

        const arrayBuffer = await imageRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

        imageContents.push({
          year: img.displayDate || img.year,
          base64,
          contentType,
        });
      } catch (err) {
        console.error(`Failed to fetch image:`, err);
      }
    }

    if (imageContents.length === 0) {
      return Response.json({ error: 'Could not load images for analysis' }, { status: 500 });
    }

    // Build message content for Claude
    const messageContent = [];

    messageContent.push({
      type: 'text',
      text: `Analyze these ${imageContents.length} Google Street View images of: ${address}\n\nTime periods shown: ${imageContents.map(i => i.year).join(', ')}`,
    });

    for (const img of imageContents) {
      messageContent.push({
        type: 'text',
        text: `Image from ${img.year}:`,
      });
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.contentType,
          data: img.base64,
        },
      });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: `You are a commercial real estate analyst. Analyze the provided Google Street View images of the same address taken in different years.

Write a concise report with these 5 sections. Use plain text only - no markdown, no bold, no tables, no bullet points. Just clean paragraphs with section headers in ALL CAPS.

CONSTRUCTION AND DEVELOPMENT
One short paragraph describing any new buildings, demolitions, or development visible across the timeline.

RETAIL AND BUSINESS ACTIVITY
One short paragraph on storefront vacancy, new businesses, or commercial changes visible.

NEIGHBORHOOD TRAJECTORY
One short paragraph on gentrification signals, decline, or stability based only on visual evidence.

INFRASTRUCTURE AND STREETSCAPE
One short paragraph on changes to roads, sidewalks, lighting, trees, or street furniture.

OVERALL NARRATIVE
Two sentences maximum summarizing what happened here and where it appears to be heading.

Then on a new line at the very end, output ONLY this JSON with no other text after it:
{"score": 7, "label": "Active Improvement", "justification": "One sentence of evidence."}

Score labels: 1-2 "Significant Decline", 3 "Gradual Decline", 4-5 "Mostly Stable", 6 "Early Improvement Signs", 7-8 "Active Improvement", 9 "Strong Growth", 10 "Dramatic Transformation"

Be concise. Each section must be 2-4 sentences maximum.`,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errData = await anthropicRes.json();
      console.error('Anthropic API error:', errData);
      return Response.json({ error: 'AI analysis failed' }, { status: 500 });
    }

    const anthropicData = await anthropicRes.json();
    const fullText = anthropicData.content[0].text;

    // Parse the score JSON from the end of the response
    let score = { score: 5, label: 'Unable to score', justification: 'Analysis unavailable.' };
    try {
      const jsonMatch = fullText.match(/\{[^{}]*"score"[^{}]*\}/);
      if (jsonMatch) {
        score = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Score parsing failed:', e);
    }

    // Remove the JSON from the analysis text
    const analysisText = fullText.replace(/\{[^{}]*"score"[^{}]*\}/, '').trim();

    return Response.json({
      analysis: analysisText,
      score,
    });

  } catch (error) {
    console.error('Analyze route error:', error);
    return Response.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}