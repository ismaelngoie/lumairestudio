import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id } = await request.json() as any;

    // A Standard "Classic Wedding" Template
    const templateEvents = [
      { time: '10:00', act: 'Hair & Makeup Starts' },
      { time: '14:00', act: 'Vendor Arrival' },
      { time: '16:00', act: 'Ceremony' },
      { time: '17:00', act: 'Cocktail Hour' },
      { time: '18:00', act: 'Dinner & Reception' },
      { time: '22:00', act: 'Event Concludes' }
    ];

    const stmt = env.DB.prepare(`INSERT INTO timeline_events (id, client_id, start_time, activity) VALUES (?, ?, ?, ?)`);
    const batch = templateEvents.map(evt => stmt.bind('evt-' + Date.now() + Math.random(), client_id, evt.time, evt.act));
    
    await env.DB.batch(batch);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
