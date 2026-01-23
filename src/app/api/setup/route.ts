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
      // --- STEP 1: RESET (DELETE OLD TABLES) ---
      `DROP TABLE IF EXISTS wedding_vendors`,
      `DROP TABLE IF EXISTS vendor_logs`,
      `DROP TABLE IF EXISTS social_plans`,
      `DROP TABLE IF EXISTS documents`,
      `DROP TABLE IF EXISTS messages`,
      `DROP TABLE IF EXISTS timeline_events`,
      `DROP TABLE IF EXISTS workflow_template_items`,
      `DROP TABLE IF EXISTS workflow_templates`,
      `DROP TABLE IF EXISTS tasks`,
      `DROP TABLE IF EXISTS weddings`,
      `DROP TABLE IF EXISTS clients`,
      `DROP TABLE IF EXISTS vendors`,
      `DROP TABLE IF EXISTS planners`,

      // --- STEP 2: REBUILD (CREATE NEW TABLES) ---
      `CREATE TABLE planners (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          created_at INTEGER DEFAULT (unixepoch())
      )`,
      `CREATE TABLE clients (
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
      `CREATE TABLE weddings (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          status TEXT DEFAULT 'planning', 
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT, 
          due_date TEXT,
          is_completed BOOLEAN DEFAULT 0,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE workflow_templates (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT
      )`,
      `CREATE TABLE workflow_template_items (
          id TEXT PRIMARY KEY,
          template_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT,
          days_before_wedding INTEGER,
          FOREIGN KEY (template_id) REFERENCES workflow_templates(id)
      )`,
      `CREATE TABLE timeline_events (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          activity TEXT NOT NULL,
          notes TEXT,
          order_index INTEGER DEFAULT 0,
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE vendors (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          business_name TEXT NOT NULL,
          category TEXT NOT NULL, 
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          FOREIGN KEY (planner_id) REFERENCES planners(id)
      )`,
      `CREATE TABLE wedding_vendors (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          status TEXT DEFAULT 'proposed',
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )`,
      `CREATE TABLE vendor_logs (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          client_id TEXT,
          note TEXT NOT NULL,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      )`,
      `CREATE TABLE documents (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          name TEXT NOT NULL,
          file_type TEXT,
          url TEXT NOT NULL,
          uploaded_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE messages (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          type TEXT,
          summary TEXT NOT NULL,
          date TEXT,
          FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,
      `CREATE TABLE social_plans (
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
      message: "✅ Database RESET and REBUILT successfully! The schema is now correct." 
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
