import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();

    if (!env || !env.DB) {
      throw new Error("CRITICAL ERROR: The 'DB' binding is missing.");
    }

    const statements = [
      // --- CORE TABLES ---
      `CREATE TABLE IF NOT EXISTS planners (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          created_at INTEGER DEFAULT (unixepoch())
      )`,
      `CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          partner_1_name TEXT NOT NULL,
          partner_2_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          notes TEXT,
          wedding_date TEXT,
          venue_name TEXT,
          guest_count INTEGER,
          status TEXT DEFAULT 'active',
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (planner_id) REFERENCES planners(id)
      )`,
      `CREATE TABLE IF NOT EXISTS weddings (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          status TEXT DEFAULT 'planning', 
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      
      // --- FEATURE: WORKFLOW & TASKS ---
      `CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT, 
          due_date TEXT,
          is_completed BOOLEAN DEFAULT 0,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      // MISSING TABLE 1: Workflow Templates (Reusable lists)
      `CREATE TABLE IF NOT EXISTS workflow_templates (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT
      )`,
      // MISSING TABLE 2: Template Items (The actual tasks in the template)
      `CREATE TABLE IF NOT EXISTS workflow_template_items (
          id TEXT PRIMARY KEY,
          template_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT,
          days_before_wedding INTEGER, -- Auto-calculate due date based on this
          FOREIGN KEY (template_id) REFERENCES workflow_templates(id)
      )`,

      // --- FEATURE: TIMELINE ---
      `CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          activity TEXT NOT NULL,
          notes TEXT,
          order_index INTEGER DEFAULT 0,
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // --- FEATURE: VENDOR ROLODEX ---
      `CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          business_name TEXT NOT NULL,
          category TEXT NOT NULL, 
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          FOREIGN KEY (planner_id) REFERENCES planners(id)
      )`,
      `CREATE TABLE IF NOT EXISTS wedding_vendors (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          status TEXT DEFAULT 'proposed', -- proposed, booked, paid
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )`,
      // MISSING TABLE 3: Vendor Logs (Communication notes)
      `CREATE TABLE IF NOT EXISTS vendor_logs (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          client_id TEXT, -- Optional: link note to specific wedding
          note TEXT NOT NULL,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )`,

      // --- FEATURE: DOCUMENTS & STORAGE ---
      // MISSING TABLE 4: Documents (Metadata for files)
      `CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          name TEXT NOT NULL,
          file_type TEXT, -- e.g., 'contract', 'moodboard'
          url TEXT NOT NULL, -- Link to Cloudflare R2 or external storage
          uploaded_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // --- FEATURE: DASHBOARD MESSAGES ---
      // MISSING TABLE 5: Messages (Logs of emails/calls)
      `CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          type TEXT, -- 'email', 'call', 'text'
          summary TEXT NOT NULL,
          date TEXT,
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // --- FEATURE: SOCIALS ---
      `CREATE TABLE IF NOT EXISTS social_plans (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          platform TEXT,
          handle_hashtag TEXT,
          content_ideas TEXT,
          status TEXT DEFAULT 'planned',
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`
    ];

    const batch = statements.map(stmt => env.DB.prepare(stmt));
    await env.DB.batch(batch);

    return NextResponse.json({ 
      message: "✅ PRODUCTION Database setup complete! All 13 tables created." 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ 
      error: "Failed to setup database", 
      message: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}
