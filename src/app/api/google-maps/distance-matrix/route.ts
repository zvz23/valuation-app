import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origins = searchParams.get('origins');
  const destinations = searchParams.get('destinations');
  const mode = searchParams.get('mode') || 'driving';
  
  if (!origins || !destinations) {
    console.error('Distance Matrix API: Missing required parameters');
    return NextResponse.json({ error: 'origins and destinations are required' }, { status: 400 });
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Distance Matrix API: Google Maps API key not configured');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log(`Distance Matrix API: Calculating travel time from ${origins} to ${destinations} via ${mode}`);
  
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&units=metric&region=au&key=${apiKey}`;
    
    console.log(`Distance Matrix API: Making request to Google with URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Property Valuation App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Distance Matrix API: HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Distance Matrix API: Response status: ${data.status}`);
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Distance Matrix API: Google API quota exceeded');
      return NextResponse.json({ error: 'Google API quota exceeded' }, { status: 429 });
    }
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('Distance Matrix API: Google API request denied - check API key and permissions');
      return NextResponse.json({ error: 'Google API request denied' }, { status: 403 });
    }
    
    if (data.status === 'INVALID_REQUEST') {
      console.error('Distance Matrix API: Invalid request parameters');
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
    
    if (data.status !== 'OK') {
      console.error(`Distance Matrix API: Unexpected status: ${data.status}`);
      return NextResponse.json({ error: `Google API returned status: ${data.status}` }, { status: 500 });
    }
    
    // Validate and enhance response data
    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      console.warn('Distance Matrix API: No valid route data in response');
      return NextResponse.json({ 
        ...data,
        status: 'ZERO_RESULTS',
        error_message: 'No route found between the specified locations'
      });
    }
    
    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      console.warn(`Distance Matrix API: Route element status: ${element.status}`);
      return NextResponse.json({ 
        ...data,
        error_message: `Route calculation failed: ${element.status}`
      });
    }
    
    console.log(`Distance Matrix API: Successfully calculated route - Distance: ${element.distance?.text}, Duration: ${element.duration?.text}`);
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Distance Matrix API: Error occurred:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout - Google API took too long to respond' }, { status: 408 });
    }
    
    return NextResponse.json(
      { error: 'Failed to calculate travel time' }, 
      { status: 500 }
    );
  }
} 