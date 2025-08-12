import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { Buffer } from 'buffer';

function escapeForSvg(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function fetchStaticMap(address: string, apiKey: string): Promise<Buffer> {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${encodeURIComponent(address)}&key=${apiKey}`;
  const arrayBuffer = await fetch(mapUrl).then(res => res.arrayBuffer());
  return Buffer.from(arrayBuffer);
}

async function renderAddressOnMap(mapBuffer: Buffer, address: string): Promise<Buffer> {
  const safe = escapeForSvg(address);
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <text x="300" y="40" font-size="18" font-family="sans-serif" font-weight="600" fill="#111" text-anchor="middle">${safe}</text>
    </svg>
  `;
  return await sharp(mapBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
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
    // Fetch map and render address text inside the image above the marker
    const baseMap = await fetchStaticMap(address, apiKey);
    const mapImageBuffer = await renderAddressOnMap(baseMap, address);
    
    console.log(`Custom Map API: Generated map image (${mapImageBuffer.length} bytes)`);
    
    // Return the image as PNG
    return new NextResponse(mapImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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