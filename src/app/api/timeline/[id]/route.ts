import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext();
  const { id } = await params;
  await env.DB.prepare('DELETE FROM timeline_events WHERE id = ?').bind(id).run();
  return NextResponse.json({ success: true });
}
