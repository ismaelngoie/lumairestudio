import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// POST: Add a new Timeline Event
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id, start_time, activity } = await request.json() as any;
    const id = 'evt-' + Date.now();

    await env.DB.prepare(`
      INSERT INTO timeline_events (id, client_id, start_time, activity)
      VALUES (?, ?, ?, ?)
    `).bind(id, client_id, start_time, activity).run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
