import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// POST: Add new Handle, Hashtag, or Idea
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id, type, value, platform } = await request.json() as any;
    const id = 'soc-' + Date.now();
    const status = type === 'idea' ? 'todo' : '';

    await env.DB.prepare(`
      INSERT INTO social_tracker (id, client_id, type, value, platform, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, client_id, type, value, platform, status).run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove item
export async function DELETE(request: Request) {
  const { env } = getRequestContext();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if(!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  await env.DB.prepare('DELETE FROM social_tracker WHERE id = ?').bind(id).run();
  return NextResponse.json({ success: true });
}

// PATCH: Toggle Status (Pending <-> Posted)
export async function PATCH(request: Request) {
  const { env } = getRequestContext();
  const { id, status } = await request.json() as any;
  
  await env.DB.prepare('UPDATE social_tracker SET status = ? WHERE id = ?').bind(status, id).run();
  return NextResponse.json({ success: true });
}
