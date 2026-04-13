export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return Response.json({ error: 'Address is required' }, { status: 400 });
  }

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // Geocode the address to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;

    // Basic Street View coverage check
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&source=outdoor&key=${API_KEY}`;
    const metaRes = await fetch(metadataUrl);
    const metaData = await metaRes.json();

    if (metaData.status !== 'OK') {
      return Response.json({
        error: 'No Street View coverage found for this address. Try a major city address for best results.'
      }, { status: 404 });
    }

    // Return coordinates — client will discover historical panos using Maps JS API
    return Response.json({
      address: formattedAddress,
      lat,
      lng,
      currentPanoId: metaData.pano_id,
      currentDate: metaData.date,
    });

  } catch (error) {
    console.error('Street View API error:', error);
    return Response.json({ error: 'Failed to fetch Street View data' }, { status: 500 });
  }
}