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
      {
        input: {
          prompt: prompt
        }
      }
    );

    if (!output || typeof output !== 'object' || !Array.isArray(output)) {
      throw new Error('Unexpected output format from Replicate API');
    }

    const imageUrl = output[0];

    if (typeof imageUrl !== 'string') {
      throw new Error('Generated image URL is not a string');
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}