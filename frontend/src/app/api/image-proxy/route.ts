import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy API Route
 * Fetches images from external URLs and returns them as base64
 * This bypasses CORS restrictions for PDF generation
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);
    
    // Fetch the image from the server side (no CORS restrictions)
    const response = await fetch(decodedUrl, {
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the image as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert to base64
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
