import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// POST: Apply a Workflow Template to a Client
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id, template_id } = await request.json() as any;

    // 1. Get the Client's Wedding Date
    const client = await env.DB.prepare('SELECT wedding_date FROM clients WHERE id = ?').bind(client_id).first<any>();
    if (!client || !client.wedding_date) throw new Error("Client has no wedding date set.");

    // 2. Get the Template Items
    const { results: items } = await env.DB.prepare('SELECT * FROM workflow_template_items WHERE template_id = ?').bind(template_id).all<any>();
    if (items.length === 0) throw new Error("Template is empty.");

    // 3. The Automation Loop
    const weddingDate = new Date(client.wedding_date);
    const insertStmt = env.DB.prepare(`
      INSERT INTO tasks (id, client_id, title, category, due_date, is_completed)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    const batch = items.map(item => {
      // MATH: Calculate Due Date (Wedding Date - Days Before)
      const dueDate = new Date(weddingDate);
      dueDate.setDate(weddingDate.getDate() - item.days_before_wedding);
      
      const dueDateStr = dueDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const taskId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      return insertStmt.bind(taskId, client_id, item.title, item.category, dueDateStr);
    });

    // 4. Execute all inserts at once
    await env.DB.batch(batch);

    return NextResponse.json({ success: true, count: items.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
