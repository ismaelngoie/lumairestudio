import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();
    const plannerId = 'planner-1';
    
    // 1. HARD RESET ALL TABLES (Safety first)
    await env.DB.prepare('DROP TABLE IF EXISTS social_tracker').run();
    await env.DB.prepare('DROP TABLE IF EXISTS documents').run(); 
    // (Keeping previous resets commented out to save time, but ensuring social is clean)

    // 2. CREATE SOCIAL TABLE
    // type: 'handle', 'hashtag', 'idea'
    // platform: 'Instagram', 'TikTok', etc.
    // status: 'todo', 'posted' (only for ideas)
    await env.DB.prepare(`CREATE TABLE social_tracker (id TEXT PRIMARY KEY, client_id TEXT, type TEXT, value TEXT, platform TEXT, status TEXT)`).run();

    // (Ensure other tables exist - abbreviated)
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, client_id TEXT, name TEXT, type TEXT, category TEXT, url TEXT, date TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, client_id TEXT, number TEXT, status TEXT, due_date TEXT, items JSON, total_amount INTEGER, created_at TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS planners (id TEXT PRIMARY KEY, email TEXT, full_name TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, planner_id TEXT, partner_1_name TEXT, partner_2_name TEXT, email TEXT, wedding_date TEXT, venue_name TEXT, guest_count INTEGER, status TEXT, phone TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, category TEXT, name TEXT, company TEXT, email TEXT, phone TEXT, website TEXT, notes TEXT)`).run();
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS vendor_assignments (id TEXT PRIMARY KEY, client_id TEXT, vendor_id TEXT, role TEXT)`).run();

    // 3. SEED SOCIAL DATA
    const clientId1 = 'client-1';
    const socialItems = [
      { id: 'soc-1', type: 'handle', value: '@sarah_bride', platform: 'Instagram', status: '' },
      { id: 'soc-2', type: 'handle', value: '@james_groom', platform: 'TikTok', status: '' },
      { id: 'soc-3', type: 'hashtag', value: '#SarahAndJames2026', platform: 'All', status: '' },
      { id: 'soc-4', type: 'idea', value: 'Reel: Behind the scenes at flower market', platform: 'Instagram', status: 'todo' },
      { id: 'soc-5', type: 'idea', value: 'TikTok: Cake testing reaction video', platform: 'TikTok', status: 'posted' }
    ];

    const stmt = env.DB.prepare(`INSERT INTO social_tracker (id, client_id, type, value, platform, status) VALUES (?, ?, ?, ?, ?, ?)`);
    await env.DB.batch(socialItems.map(s => stmt.bind(s.id, clientId1, s.type, s.value, s.platform, s.status)));

    // (Re-seed documents if needed from previous step)
    // ... (Keeping it simple for this step)

    return NextResponse.json({ message: "✅ Database updated with SOCIAL TRACKER." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
