import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { Buffer } from 'buffer';

async function generateCustomMapImage(address: string, apiKey: string, fullAddressLabel: string): Promise<Buffer> {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${encodeURIComponent(address)}&key=${apiKey}`;

  const arrayBuffer = await fetch(mapUrl).then(res => res.arrayBuffer());

  const nodeBuffer = Buffer.from(arrayBuffer); 

  // ✅ Create address text positioned directly above the red marker (no background)
  const addressLabelSvg = `
    <svg width="600" height="400">
      <!-- Address text directly on map, positioned above center (where red marker is) -->
      <text x="300" y="140" font-size="18" font-family="Arial, sans-serif" font-weight="bold" fill="#141414" text-anchor="middle" alignment-baseline="middle" stroke="#ffffff" stroke-width="1">
        ${fullAddressLabel}
      </text>
    </svg>
  `;

  return await sharp(nodeBuffer)
    .composite([{ 
      input: Buffer.from(addressLabelSvg), 
      top: 0, 
      left: 0,
      blend: 'over'
    }])
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
    // Generate custom map image with address text overlay
    const mapImageBuffer = await generateCustomMapImage(address, apiKey, address);
    
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