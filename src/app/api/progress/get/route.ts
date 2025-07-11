import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_oportunidad } = body;

    if (!id_oportunidad) {
      return NextResponse.json({ message: 'id_oportunidad is required' }, { status: 400 });
    }

    const response = await fetch('https://magicloops.dev/api/loop/dafdd36b-8aae-46ee-8005-92d06fd4629e/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id_oportunidad }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from external API (/get_avance): ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error from external API: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to get progress from proxy:', error);
    return NextResponse.json({ message: 'Failed to get progress', error: error.message }, { status: 500 });
  }
}
