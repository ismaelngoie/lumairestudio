import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// Define what we expect from the frontend
interface ClientData {
  partner_1_name: string;
  partner_2_name: string;
  email: string;
  wedding_date: string;
  venue_name: string;
  guest_count: number;
}

// HANDLE POST: Create a New Client
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    // Explicitly tell TypeScript what this data looks like
    const data = (await request.json()) as ClientData;

    // Generate a simple ID
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
