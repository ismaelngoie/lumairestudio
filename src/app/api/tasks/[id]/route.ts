import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// HANDLE PATCH: Update Task (Toggle Status OR Edit Details)
export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = getRequestContext();
    const { id } = await params;
    const body = await request.json() as any;

    // Dynamic Update: Check what fields are being sent
    const updates: string[] = [];
    const values: any[] = [];

    if (body.is_completed !== undefined) { updates.push("is_completed = ?"); values.push(body.is_completed); }
    if (body.title !== undefined) { updates.push("title = ?"); values.push(body.title); }
    if (body.due_date !== undefined) { updates.push("due_date = ?"); values.push(body.due_date); }

    if (updates.length > 0) {
      values.push(id);
      await env.DB.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// HANDLE DELETE: Remove a Task
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = getRequestContext();
  const { id } = await params;
  await env.DB.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  return NextResponse.json({ success: true });
}
