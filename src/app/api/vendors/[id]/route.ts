import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// GET: Fetch single vendor details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { env } = getRequestContext();
  const { id } = await params;
  const vendor = await env.DB.prepare('SELECT * FROM vendors WHERE id = ?').bind(id).first();
  return NextResponse.json(vendor);
}

// PATCH: Update vendor details (Notes, Phone, etc.)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { env } = getRequestContext();
    const { id } = await params;
    const body = await request.json() as any;

    const updates: string[] = [];
    const values: any[] = [];

    // Dynamically build the update query
    ['name', 'company', 'email', 'phone', 'website', 'category', 'notes'].forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    });

    if (updates.length === 0) return NextResponse.json({ success: true });

    values.push(id);
    await env.DB.prepare(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
