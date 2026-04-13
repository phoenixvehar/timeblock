export async function POST(request) {
  try {
    const { images, address } = await request.json();

    if (!images || images.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    // Step 1: Fetch each image and convert to base64
    const imageContents = [];

    for (const img of images) {
      try {
        const imageRes = await fetch(img.url);
        if (!imageRes.ok) continue;

        const arrayBuffer = await imageRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

        imageContents.push({
          year: img.year,
          base64,
          contentType,
        });
      } catch (err) {
        console.error(`Failed to fetch image for year ${img.year}:`, err);
      }
    }

    if (imageContents.length === 0) {
      return Response.json({ error: 'Could not load images for analysis' }, { status: 500 });
    }

    // Step 2: Build the message content for Claude
    const messageContent = [];

    // Add intro text
    messageContent.push({
      type: 'text',
      text: `You are analyzing Google Street View images of: ${address}\n\nThe following ${imageContents.length} images show this location across different time periods: ${imageContents.map(i => i.year).join(', ')}.\n\nPlease analyze these images carefully:`,
    });

    // Add each image with its year label
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

    // Step 3: Send to Claude Haiku with the analysis prompt
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: `You are an expert commercial real estate analyst specializing in neighborhood trend analysis and market intelligence. You have been given a series of Google Street View images of the same address taken in different years.

Your job is to analyze these images and produce a structured report with the following sections:

1. CONSTRUCTION & DEVELOPMENT
Describe any new buildings, demolitions, construction activity, or development projects visible near the address across the timeline. Note approximate timing based on which images show changes.

2. RETAIL & BUSINESS ACTIVITY
Identify signs of retail vacancy (empty storefronts, for lease signs, boarded windows) or business growth (new signage, activity, filled spaces). Note turnover patterns if visible.

3. GENTRIFICATION & NEIGHBORHOOD TRAJECTORY
Look for signals of gentrification (new luxury development, renovation of older buildings, changing streetscape quality, new amenities) or decline (deterioration, vacancy, reduced maintenance). Be specific about what visual evidence supports your conclusion.

4. INFRASTRUCTURE & STREETSCAPE
Note changes to roads, sidewalks, street furniture, lighting, signage, landscaping, bike lanes, or any public realm improvements or degradation.

5. OVERALL NARRATIVE
Write 2-3 sentences summarizing the story of this location. What has happened here? Where does it appear to be heading?

6. NEIGHBORHOOD CHANGE SCORE
Give this location a score from 1 to 10 based on the trajectory of change you observe:
- 1-3: Declining or deteriorating
- 4-6: Stable with minor change
- 7-9: Improving with visible investment
- 10: Dramatic positive transformation

Return your score as a JSON object at the very end of your response in this exact format:
{"score": 7, "label": "Active Improvement", "justification": "Significant new construction and retail infill visible between 2015 and 2023."}

Score labels to use:
1-2: "Significant Decline"
3: "Gradual Decline"
4-5: "Mostly Stable"
6: "Early Improvement Signs"
7-8: "Active Improvement"
9: "Strong Growth"
10: "Dramatic Transformation"

Be honest and evidence-based. Only comment on what you can actually see in the images. Do not speculate beyond the visual evidence.`,
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

    // Step 4: Parse the score JSON from the end of the response
    let score = { score: 5, label: 'Unable to score', justification: 'Analysis unavailable.' };
    try {
      const jsonMatch = fullText.match(/\{[^{}]*"score"[^{}]*\}/);
      if (jsonMatch) {
        score = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Score parsing failed:', e);
    }

    // Step 5: Clean the analysis text (remove the JSON from the end)
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