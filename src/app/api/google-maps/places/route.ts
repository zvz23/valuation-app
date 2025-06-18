import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  const keyword = searchParams.get('keyword');
  const radius = searchParams.get('radius') || '5000';
  
  if (!lat || !lng || !type) {
    console.error('Places API: Missing required parameters');
    return NextResponse.json({ error: 'lat, lng, and type are required' }, { status: 400 });
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Places API: Google Maps API key not configured');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log(`Places API: Searching for ${type} near ${lat}, ${lng}${keyword ? ` with keyword: ${keyword}` : ''}`);
  
  try {
    // Use rankby=distance for most accurate nearby results (cannot use with radius)
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=${type}&key=${apiKey}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    console.log(`Places API: Making request to Google with URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
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
      console.error(`Places API: HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Places API: Response status: ${data.status}, found ${data.results?.length || 0} results`);
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Places API: Google API quota exceeded');
      return NextResponse.json({ error: 'Google API quota exceeded' }, { status: 429 });
    }
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('Places API: Google API request denied - check API key and permissions');
      return NextResponse.json({ error: 'Google API request denied' }, { status: 403 });
    }
    
    if (data.status === 'INVALID_REQUEST') {
      console.error('Places API: Invalid request parameters');
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn(`Places API: No results found for ${type} near ${lat}, ${lng}`);
      return NextResponse.json({ results: [], status: 'ZERO_RESULTS' });
    }
    
    if (data.status !== 'OK') {
      console.error(`Places API: Unexpected status: ${data.status}`);
      return NextResponse.json({ error: `Google API returned status: ${data.status}` }, { status: 500 });
    }
    
    // Filter and enhance results
    const filteredResults = (data.results || [])
      .filter((place: any) => {
        // Filter out places without essential data
        return place.geometry && 
               place.geometry.location && 
               place.name && 
               place.place_id &&
               place.business_status !== 'CLOSED_PERMANENTLY';
      })
      .slice(0, 20); // Limit to top 20 results for performance
    
    console.log(`Places API: Returning ${filteredResults.length} filtered results`);
    
    return NextResponse.json({
      ...data,
      results: filteredResults
    });
    
  } catch (error: any) {
    console.error('Places API: Error occurred:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout - Google API took too long to respond' }, { status: 408 });
    }
    
    return NextResponse.json(
      { error: 'Failed to search places' }, 
      { status: 500 }
    );
  }
} 