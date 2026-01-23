import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// GET: List all clients
export async function GET() {
  const { env } = getRequestContext();
  const { results } = await env.DB.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  return NextResponse.json(results);
}

// POST: Add new client AND Trigger Automation
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const body = await request.json() as any;
    const id = 'client-' + Date.now();
    const plannerId = 'planner-1';

    // 1. Insert Client
    await env.DB.prepare(`
      INSERT INTO clients (id, planner_id, partner_1_name, partner_2_name, email, wedding_date, venue_name, guest_count, status, phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, plannerId, body.partner_1_name, body.partner_2_name, body.email, body.wedding_date, body.venue_name, body.guest_count, 'active', body.phone || '', '').run();

    // 2. AUTOMATION: Draft Welcome Email
    const welcomeSubject = `Welcome to Lumaire, ${body.partner_1_name} & ${body.partner_2_name}!`;
    const welcomeBody = `Hi ${body.partner_1_name} & ${body.partner_2_name},\n\nI am so thrilled to officially welcome you to the Lumaire family! We are going to plan the most incredible wedding at ${body.venue_name}.\n\nI'll be sending over your initial onboarding documents shortly.\n\nCheers,\nIsmael`;
    
    await env.DB.prepare(`
      INSERT INTO email_queue (id, client_id, subject, body, type, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind('queue-' + Date.now(), id, welcomeSubject, welcomeBody, 'welcome', new Date().toISOString().split('T')[0], 'pending').run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
