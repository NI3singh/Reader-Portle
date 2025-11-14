import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'Path is required' },
      { status: 400 }
    );
  }

  try {
    const url = `https://huggingface.co/datasets/${process.env.HF_DATASET}/resolve/main/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const buffer = await response.arrayBuffer();
    const fileName = path.split('/').pop() || 'download';
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}