import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const plannerId = 'planner-1';
    
    // 1. SETUP TABLES (Idempotent)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, category TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, website TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendor_assignments (id TEXT PRIMARY KEY, client_id TEXT, vendor_id TEXT, role TEXT)`).run();

    // 2. CREATE VENDORS (The Rolodex)
    await env.DB.prepare('DELETE FROM vendors').run();
    
    const vendors = [
      { id: 'v-1', cat: 'Photography', name: 'Sarah Jenkins', comp: 'Lens & Light', email: 'sarah@lenslight.com', phone: '555-0101', web: 'lenslight.com' },
      { id: 'v-2', cat: 'Floral', name: 'Roberto Flores', comp: 'Bloomsbury', email: 'rob@bloomsbury.com', phone: '555-0102', web: 'bloomsbury.com' },
      { id: 'v-3', cat: 'Catering', name: 'Chef Mike', comp: 'Gourmet Bites', email: 'mike@gourmetbites.com', phone: '555-0103', web: 'gourmetbites.com' },
      { id: 'v-4', cat: 'Music', name: 'DJ Pulse', comp: 'Pulse Events', email: 'booking@pulse.com', phone: '555-0104', web: 'pulseevents.com' },
      { id: 'v-5', cat: 'Venue', name: 'Elena Fisher', comp: 'The Grand Hotel', email: 'events@grandhotel.com', phone: '555-0105', web: 'grandhotel.com' }
    ];

    const vStmt = env.DB.prepare(`INSERT INTO vendors (id, category, name, company, email, phone, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const vBatch = vendors.map(v => vStmt.bind(v.id, v.cat, v.name, v.comp, v.email, v.phone, v.web, 'Preferred vendor.'));
    await env.DB.batch(vBatch);

    // 3. ASSIGN VENDORS TO CLIENT (Sarah & James)
    await env.DB.prepare('DELETE FROM vendor_assignments').run();
    await env.DB.prepare(`INSERT INTO vendor_assignments (id, client_id, vendor_id, role) VALUES (?, ?, ?, ?)`)
      .bind('assign-1', 'client-1', 'v-1', 'Primary Photographer').run();
    await env.DB.prepare(`INSERT INTO vendor_assignments (id, client_id, vendor_id, role) VALUES (?, ?, ?, ?)`)
      .bind('assign-2', 'client-1', 'v-5', 'Ceremony & Reception').run();

    return NextResponse.json({ message: "✅ Database seeded with VENDORS and ASSIGNMENTS." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
