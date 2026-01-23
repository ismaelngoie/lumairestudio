import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const plannerId = 'planner-1';
    
    // --- PART 1: CORE DATA (Planners & Clients) ---
    await env.DB.prepare(`INSERT OR IGNORE INTO planners (id, email, full_name) VALUES (?, ?, ?)`).bind(plannerId, 'demo@lumaire.com', 'Ismael Ngoie').run();
    
    // Ensure Client Table Exists & Add Sarah
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, planner_id TEXT, partner_1_name TEXT, partner_2_name TEXT, email TEXT, wedding_date TEXT, venue_name TEXT, guest_count INTEGER, status TEXT, phone TEXT, notes TEXT)`).run();
    
    await env.DB.prepare(`INSERT OR IGNORE INTO clients (id, planner_id, partner_1_name, partner_2_name, email, wedding_date, venue_name, guest_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind('client-1', plannerId, 'Sarah', 'James', 'sarah@example.com', '2026-10-12', 'The Grand Hotel', 150, 'active').run();

    // --- PART 2: VENDORS (THE FIX) ---
    // We DROP the table to force it to re-create with the correct "name" column
    await env.DB.prepare('DROP TABLE IF EXISTS vendors').run();
    await env.DB.prepare('DROP TABLE IF EXISTS vendor_assignments').run();

    // Re-create tables with the correct schema
    await env.DB.prepare(`CREATE TABLE vendors (id TEXT PRIMARY KEY, category TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, website TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE vendor_assignments (id TEXT PRIMARY KEY, client_id TEXT, vendor_id TEXT, role TEXT)`).run();

    // Insert Vendors
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

    // Assign Vendors to Sarah
    await env.DB.prepare(`INSERT INTO vendor_assignments (id, client_id, vendor_id, role) VALUES (?, ?, ?, ?)`)
      .bind('assign-1', 'client-1', 'v-1', 'Primary Photographer').run();
    await env.DB.prepare(`INSERT INTO vendor_assignments (id, client_id, vendor_id, role) VALUES (?, ?, ?, ?)`)
      .bind('assign-2', 'client-1', 'v-5', 'Ceremony & Reception').run();

    return NextResponse.json({ message: "✅ Database fixed! Vendors table re-created and seeded." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
