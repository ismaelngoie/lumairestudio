import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    if (!env || !env.DB) throw new Error("DB binding missing");

    // 1. Create a Demo Planner
    const plannerId = 'planner-1';
    await env.DB.prepare(`INSERT OR IGNORE INTO planners (id, email, full_name) VALUES (?, ?, ?)`).bind(plannerId, 'demo@lumaire.com', 'Ismael Ngoie').run();

    // 2. Create Clients
    const clientId1 = 'client-1';
    const clientId2 = 'client-2';
    
    await env.DB.prepare(`INSERT OR IGNORE INTO clients (id, planner_id, partner_1_name, partner_2_name, email, wedding_date, venue_name, guest_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(clientId1, plannerId, 'Sarah', 'James', 'sarah@example.com', '2026-10-12', 'The Grand Hotel', 150, 'active').run();

    await env.DB.prepare(`INSERT OR IGNORE INTO clients (id, planner_id, partner_1_name, partner_2_name, email, wedding_date, venue_name, guest_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(clientId2, plannerId, 'Elena', 'Michael', 'elena@example.com', '2026-11-04', 'Seaside Pavilion', 85, 'active').run();

    // 3. Create Tasks
    await env.DB.prepare(`INSERT OR IGNORE INTO tasks (id, client_id, title, category, due_date, is_completed) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`)
      .bind('task-1', clientId1, 'Finalize seating chart', 'Planning', '2026-09-01', 0, 'task-2', clientId1, 'Send music list to DJ', 'Music', '2026-09-05', 0).run();

    // 4. Create Recent Messages (NEW: This fills the "Recent Messages" requirement)
    await env.DB.prepare(`INSERT OR IGNORE INTO messages (id, client_id, type, summary, date) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`)
      .bind(
        'msg-1', clientId1, 'email', 'Sarah sent the updated guest list.', '2026-01-22',
        'msg-2', clientId2, 'call', 'Michael wants to discuss floral budget.', '2026-01-21'
      ).run();

    return NextResponse.json({ message: "✅ Database seeded with Tasks, Clients, and MESSAGES." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
