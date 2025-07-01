import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_oportunidad, avance_json } = body;

    if (!id_oportunidad || !avance_json) {
      return NextResponse.json({ message: 'id_oportunidad and avance_json are required' }, { status: 400 });
    }

    const response = await fetch('http://contractease.ddns.net:8080/insert_avance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id_oportunidad, avance_json }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from external API (/insert_avance): ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error from external API: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to insert progress from proxy:', error);
    return NextResponse.json({ message: 'Failed to insert progress', error: error.message }, { status: 500 });
  }
}
