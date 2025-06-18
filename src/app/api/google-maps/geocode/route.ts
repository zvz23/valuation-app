import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    console.error('Geocode API: Missing required address parameter');
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Geocode API: Google Maps API key not configured');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log(`Geocode API: Geocoding address: ${address}`);
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=au&components=country:AU`;
    
    console.log(`Geocode API: Making request to Google with URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
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
      console.error(`Geocode API: HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Geocode API: Response status: ${data.status}, found ${data.results?.length || 0} results`);
    
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Geocode API: Google API quota exceeded');
      return NextResponse.json({ error: 'Google API quota exceeded' }, { status: 429 });
    }
    
    if (data.status === 'REQUEST_DENIED') {
      console.error('Geocode API: Google API request denied - check API key and permissions');
      return NextResponse.json({ error: 'Google API request denied' }, { status: 403 });
    }
    
    if (data.status === 'INVALID_REQUEST') {
      console.error('Geocode API: Invalid request parameters');
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn(`Geocode API: No results found for address: ${address}`);
      return NextResponse.json({ 
        status: 'ZERO_RESULTS', 
        results: [],
        error_message: 'Address not found. Please check the spelling and try again.'
      });
    }
    
    if (data.status !== 'OK') {
      console.error(`Geocode API: Unexpected status: ${data.status}`);
      return NextResponse.json({ error: `Google API returned status: ${data.status}` }, { status: 500 });
    }
    
    // Enhance results with Australian-specific filtering
    const enhancedResults = (data.results || []).filter((result: any) => {
      // Ensure we have essential location data
      return result.geometry && 
             result.geometry.location && 
             result.formatted_address &&
             result.address_components &&
             result.address_components.length > 0;
    });
    
    console.log(`Geocode API: Returning ${enhancedResults.length} enhanced results`);
    
    return NextResponse.json({
      ...data,
      results: enhancedResults
    });
    
  } catch (error: any) {
    console.error('Geocode API: Error occurred:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout - Google API took too long to respond' }, { status: 408 });
    }
    
    return NextResponse.json(
      { error: 'Failed to geocode address' }, 
      { status: 500 }
    );
  }
} 