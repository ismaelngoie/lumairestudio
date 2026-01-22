import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { D1Database } from '@cloudflare/workers-types';

export const runtime = 'edge';

// We explicitly tell TypeScript that DB exists here
interface Env {
  DB: D1Database;
}

export async function GET() {
  try {
    // We cast the environment to our interface
    const { env } = getRequestContext<Env>();
    
    const sql = `
      -- 1. Planners (The Users)
      CREATE TABLE IF NOT EXISTS planners (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          created_at INTEGER DEFAULT (unixepoch())
      );

      -- 2. Clients (The Couples)
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

      -- 3. Weddings (The Event Details)
      CREATE TABLE IF NOT EXISTS weddings (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          wedding_date TEXT, 
          venue_name TEXT,
          guest_count INTEGER,
          status TEXT DEFAULT 'planning', 
          FOREIGN KEY (client_id) REFERENCES clients(id)
      );

      -- 4. Tasks (The Workflow)
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

      -- 5. Timeline Events
      CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          activity TEXT NOT NULL,
          notes TEXT,
          FOREIGN KEY (wedding_id) REFERENCES weddings(id)
      );

      -- 6. Vendors (Rolodex)
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

      -- 7. Wedding Vendors (Assigning vendors to specific weddings)
      CREATE TABLE IF NOT EXISTS wedding_vendors (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          vendor_id TEXT NOT NULL,
          status TEXT DEFAULT 'proposed',
          FOREIGN KEY (wedding_id) REFERENCES weddings(id),
          FOREIGN KEY (vendor_id) REFERENCES vendors(id)
      );

      -- 8. Social Tracking
      CREATE TABLE IF NOT EXISTS social_plans (
          id TEXT PRIMARY KEY,
          wedding_id TEXT NOT NULL,
          platform TEXT,
          handle_hashtag TEXT,
          content_ideas TEXT,
          FOREIGN KEY (wedding_id) REFERENCES weddings(id)
      );
    `;

    // Now TypeScript will be happy
    await env.DB.exec(sql);

    return NextResponse.json({ 
      message: "✅ Database setup complete! All tables have been created successfully." 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: "Failed to setup database", 
      details: error 
    }, { status: 500 });
  }
}
