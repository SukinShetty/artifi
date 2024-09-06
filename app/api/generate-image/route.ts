import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      { input: { prompt } }
    );

    console.log('Replicate API output:', JSON.stringify(output, null, 2));

    let imageUrl;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      console.error('Unexpected output format:', output);
      throw new Error('Unexpected output format from Replicate API');
    }

    if (imageUrl && typeof imageUrl === 'string') {
      return NextResponse.json({ imageUrl });
    } else {
      throw new Error('No valid image URL found in the response');
    }
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}