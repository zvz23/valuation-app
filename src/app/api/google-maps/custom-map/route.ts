import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

async function fetchStaticMap(address: string, apiKey: string): Promise<Buffer> {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${encodeURIComponent(address)}&key=${apiKey}`;
  const arrayBuffer = await fetch(mapUrl).then(res => res.arrayBuffer());
  return Buffer.from(arrayBuffer);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    console.error('Custom Map API: Missing required address parameter');
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Custom Map API: Google Maps API key not configured');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log(`Custom Map API: Generating custom map for address: ${address}`);
  
  try {
    // Return Google Static Map image as-is (no text overlay) to avoid artifacts
    const mapImageBuffer = await fetchStaticMap(address, apiKey);
    
    console.log(`Custom Map API: Generated map image (${mapImageBuffer.length} bytes)`);
    
    // Return the image as PNG
    return new NextResponse(mapImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': mapImageBuffer.length.toString(),
      },
    });
    
  } catch (error: any) {
    console.error('Custom Map API: Error occurred:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate custom map image' }, 
      { status: 500 }
    );
  }
}