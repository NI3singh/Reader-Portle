import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    const response = await fetch(
      `https://huggingface.co/api/datasets/${process.env.HF_DATASET}/tree/main${path ? '/' + path : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}