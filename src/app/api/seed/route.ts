import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const plannerId = 'planner-1';
    
    // 1. HARD RESET ALL TABLES (To fix any schema mismatches)
    // We drop these tables to ensure they are re-created with the latest columns
    await env.DB.prepare('DROP TABLE IF EXISTS documents').run();
    await env.DB.prepare('DROP TABLE IF EXISTS invoices').run();
    // (Optional: You can uncomment these if you ever need to reset vendors/clients too)
    // await env.DB.prepare('DROP TABLE IF EXISTS vendors').run();
    // await env.DB.prepare('DROP TABLE IF EXISTS vendor_assignments').run();

    // 2. RE-CREATE TABLES (With Correct Schemas)
    
    // Documents (Fixed: Added 'type' column)
    await env.DB.prepare(`CREATE TABLE documents (id TEXT PRIMARY KEY, client_id TEXT, name TEXT, type TEXT, category TEXT, url TEXT, date TEXT)`).run();
    
    // Invoices
    await env.DB.prepare(`CREATE TABLE invoices (id TEXT PRIMARY KEY, client_id TEXT, number TEXT, status TEXT, due_date TEXT, items JSON, total_amount INTEGER, created_at TEXT)`).run();
    
    // Core Tables (Safe 'IF NOT EXISTS' for these as they haven't changed recently)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS planners (id TEXT PRIMARY KEY, email TEXT, full_name TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, planner_id TEXT, partner_1_name TEXT, partner_2_name TEXT, email TEXT, wedding_date TEXT, venue_name TEXT, guest_count INTEGER, status TEXT, phone TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, category TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, website TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendor_assignments (id TEXT PRIMARY KEY, client_id TEXT, vendor_id TEXT, role TEXT)`).run();


    // 3. SEED DATA
    const clientId1 = 'client-1';

    // Seed Documents
    const docs = [
      { id: 'doc-1', name: 'Service Agreement v1', type: 'PDF', cat: 'Contracts', url: '#', date: '2026-01-10' },
      { id: 'doc-2', name: 'Floral Mood Board', type: 'Image', cat: 'Design', url: 'https://images.unsplash.com/photo-1519225427186-6868692f6d44?w=400', date: '2026-02-15' },
      { id: 'doc-3', name: 'Initial Questionnaire', type: 'Form', cat: 'Questionnaires', url: '#', date: '2026-01-12' }
    ];
    const docStmt = env.DB.prepare(`INSERT INTO documents (id, client_id, name, type, category, url, date) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    await env.DB.batch(docs.map(d => docStmt.bind(d.id, clientId1, d.name, d.type, d.cat, d.url, d.date)));

    // Seed Invoices (Restoring from previous step)
    const inv1 = { id: 'inv-101', client_id: clientId1, number: 'INV-001', status: 'Paid', due_date: '2025-12-01', items: JSON.stringify([{ desc: 'Initial Deposit (50%)', amount: 3500 }]), total_amount: 3500, created_at: '2025-11-20' };
    const inv2 = { id: 'inv-102', client_id: clientId1, number: 'INV-002', status: 'Sent', due_date: '2026-09-12', items: JSON.stringify([{ desc: 'Final Balance', amount: 3500 }, { desc: 'Extra Coordination Hours', amount: 500 }]), total_amount: 4000, created_at: '2026-01-10' };
    
    const invStmt = env.DB.prepare(`INSERT INTO invoices (id, client_id, number, status, due_date, items, total_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    await env.DB.batch([
      invStmt.bind(inv1.id, inv1.client_id, inv1.number, inv1.status, inv1.due_date, inv1.items, inv1.total_amount, inv1.created_at),
      invStmt.bind(inv2.id, inv2.client_id, inv2.number, inv2.status, inv2.due_date, inv2.items, inv2.total_amount, inv2.created_at)
    ]);

    return NextResponse.json({ message: "✅ Database fixed! Documents and Invoices tables reset and seeded." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
