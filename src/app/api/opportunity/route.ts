import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_portunidad } = body;

    if (!id_portunidad) {
      return NextResponse.json({ message: 'id_portunidad is required' }, { status: 400 });
    }

    const response = await fetch('https://magicloops.dev/api/loop/454eb81b-47ec-4d4a-9d8b-b93455f282af/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id_portunidad }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from external API (/get_oportunidad): ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error from external API: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch opportunity details from proxy:', error);
    return NextResponse.json({ message: 'Failed to fetch opportunity details', error: error.message }, { status: 500 });
  }
}
