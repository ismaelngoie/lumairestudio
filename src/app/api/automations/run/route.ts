import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext();
    
    // 1. FIND TASKS DUE SOON (Tomorrow)
    // In a real app, we'd check dates properly. For demo, we grab any uncompleted task marked 'Urgent'.
    const { results: tasks } = await env.DB.prepare(`
      SELECT t.*, c.partner_1_name, c.email 
      FROM tasks t 
      JOIN clients c ON t.client_id = c.id 
      WHERE t.is_completed = 0 AND t.due_date <= date('now', '+1 day')
    `).all<any>();

    // 2. FIND RECENT WEDDINGS (Yesterday)
    const { results: recentWeddings } = await env.DB.prepare(`
      SELECT * FROM clients WHERE wedding_date = date('now', '-1 day')
    `).all<any>();

    let generatedCount = 0;

    // Generate Task Reminders
    for (const task of tasks) {
      // Check if reminder already exists
      const exists = await env.DB.prepare("SELECT id FROM email_queue WHERE client_id = ? AND type = 'reminder' AND body LIKE ?").bind(task.client_id, `%${task.title}%`).first();
      
      if (!exists) {
        await env.DB.prepare(`INSERT INTO email_queue (id, client_id, subject, body, type, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          `auto-task-${task.id}`, 
          task.client_id, 
          `Reminder: ${task.title}`, 
          `Hi ${task.partner_1_name},\n\nJust a friendly nudge that we have a deadline coming up for: ${task.title}.\n\nLet me know if you are stuck!\n\nBest,\nIsmael`,
          'reminder',
          new Date().toISOString().split('T')[0],
          'pending'
        ).run();
        generatedCount++;
      }
    }

    // Generate Thank Yous
    for (const wedding of recentWeddings) {
       await env.DB.prepare(`INSERT INTO email_queue (id, client_id, subject, body, type, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          `auto-thx-${wedding.id}`, 
          wedding.client_id, 
          `Congratulations!!!`, 
          `Dearest ${wedding.partner_1_name} & ${wedding.partner_2_name},\n\nWhat a night! It was an absolute honor to be part of your day yesterday. I hope you are resting well.\n\nI'll be in touch soon with wrap-up details, but for now, enjoy married life!\n\nWarmly,\nIsmael`,
          'thank_you',
          new Date().toISOString().split('T')[0],
          'pending'
        ).run();
       generatedCount++;
    }

    return NextResponse.json({ success: true, generated: generatedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
