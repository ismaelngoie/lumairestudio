import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = getRequestContext();

    // DEBUG CHECK: Is the database actually connected?
    if (!env || !env.DB) {
      throw new Error("CRITICAL ERROR: The 'DB' binding is missing. The app cannot find the database.");
    }
    
    const sql = `
      CREATE TABLE IF NOT EXISTS planners (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          created_at INTEGER DEFAULT (unixepoch())
      );
      CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          partner_1_name TEXT NOT NULL,
          partner_2_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          notes TEXT,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (planner_id) REFERENCES planners(id)
      );
      CREATE TABLE IF NOT EXISTS weddings (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          wedding_date TEXT, 
          venue_name TEXT,
          guest_count INTEGER,
          status TEXT DEFAULT 'planning', 
          FOREIGN KEY (client_id) REFERENCES clients(id)
      );
      CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT, 
          due_date TEXT,
          is_completed BOOLEAN DEFAULT 0,
          created_at INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (wedding_id) REFERENCES weddings(id)
      );
      CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          activity TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (wedding_id) REFERENCES weddings(id)
      );
      CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY,
          planner_id TEXT NOT NULL,
          business_name TEXT NOT NULL,
          category TEXT NOT NULL, 
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          FOREIGN KEY (planner_id) REFERENCES planners(id)
      );
      CREATE TABLE IF NOT EXISTS wedding_vendors (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          status TEXT DEFAULT 'proposed',
          FOREIGN KEY (wedding_id) REFERENCES weddings(id),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      );
      CREATE TABLE IF NOT EXISTS social_plans (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          platform TEXT,
          handle_hashtag TEXT,
          content_ideas TEXT,
          FOREIGN KEY (wedding_id) REFERENCES weddings(id)
      );
    `;

    // Execute the SQL
    await env.DB.exec(sql);

    return NextResponse.json({ 
      message: "✅ Database setup complete! All tables have been created successfully." 
    });

  } catch (error: any) {
    console.error(error);
    // This explicitly sends the error text back to you
    return NextResponse.json({ 
      error: "Failed to setup database", 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
