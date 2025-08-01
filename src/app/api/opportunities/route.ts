import { NextResponse } from 'next/server';
export const dynamic = 'force-static';

export async function GET() {
  try {
    const response = await fetch('https://magicloops.dev/api/loop/a3f448a1-695c-43a4-b708-ff8d94b037d7/run', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data on every request
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from external API (/oportunidades): ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Error from external API: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch opportunities from proxy:', error);
    return NextResponse.json({ message: 'Failed to fetch opportunities', error: error.message }, { status: 500 });
  }
}
