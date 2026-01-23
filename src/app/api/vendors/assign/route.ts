import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// POST: Assign a Vendor to a Client
export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    const { client_id, vendor_id, role } = await request.json() as any;
    const id = 'assign-' + Date.now();

    await env.DB.prepare(`
      INSERT INTO vendor_assignments (id, client_id, vendor_id, role)
      VALUES (?, ?, ?, ?)
    `).bind(id, client_id, vendor_id, role).run();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
