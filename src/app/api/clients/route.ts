import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// HANDLE POST: Create a New Client
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const data = await request.json();

    // Generate a simple ID (in a real app we might use UUIDs, but this works for now)
    const clientId = 'client-' + Date.now();
    const plannerId = 'planner-1'; // Hardcoded for this prototype

    await env.DB.prepare(`
      INSERT INTO clients (id, planner_id, partner_1_name, partner_2_name, email, wedding_date, venue_name, guest_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      clientId,
      plannerId,
      data.partner_1_name,
      data.partner_2_name,
      data.email,
      data.wedding_date,
      data.venue_name,
      data.guest_count,
      'active'
    ).run();

    // Also create a default empty Timeline for them
    await env.DB.prepare(`
      INSERT INTO weddings (id, client_id, status) VALUES (?, ?, ?)
    `).bind('wedding-' + Date.now(), clientId, 'planning').run();

    return NextResponse.json({ success: true, id: clientId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
