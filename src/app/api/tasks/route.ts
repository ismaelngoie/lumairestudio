import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// POST: Create a new Task
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id, title, due_date } = await request.json() as any;
    const id = 'task-' + Date.now();

    await env.DB.prepare(`
      INSERT INTO tasks (id, client_id, title, category, due_date, is_completed)
      VALUES (?, ?, ?, ?, ?, 0)
    `).bind(id, client_id, title, 'General', due_date).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
