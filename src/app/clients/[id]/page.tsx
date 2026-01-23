import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getRequestContext } from '@cloudflare/next-on-pages';
import NotesWidget from '@/components/clients/NotesWidget';
import TimelineEditor from '@/components/clients/TimelineEditor';
import TaskAdder from '@/components/clients/TaskAdder';
import WorkflowPicker from '@/components/clients/WorkflowPicker';

export const runtime = 'edge';

async function getClientData(id: string) {
  const { env } = getRequestContext();
  const client = await env.DB.prepare(`SELECT * FROM clients WHERE id = ?`).bind(id).first<any>();
  if (!client) return null;

  const { results: tasks } = await env.DB.prepare(`SELECT * FROM tasks WHERE client_id = ? ORDER BY due_date ASC`).bind(id).all<any>();
  const { results: messages } = await env.DB.prepare(`SELECT * FROM messages WHERE client_id = ? ORDER BY date DESC`).bind(id).all<any>();
  const { results: timeline } = await env.DB.prepare(`SELECT * FROM timeline_events WHERE client_id = ? ORDER BY start_time ASC`).bind(id).all<any>();
  const { results: templates } = await env.DB.prepare(`SELECT * FROM workflow_templates`).all<any>();

  const totalContract = client.guest_count * 150; 
  const paidAmount = totalContract * 0.4; 

  return { client, tasks, messages, timeline, templates, financials: { totalContract, paidAmount } };
}

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClientData(id);

  if (!data) return <div className="p-12 text-center">Client not found.</div>;
  const { client, tasks, messages, timeline, templates, financials } = data;

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-lumaire-brown/10">
        <div>
          <Link href="/clients" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-2 block">← Back to List</Link>
          <h1 className="text-4xl font-serif text-lumaire-brown mb-2">{client.partner_1_name} & {client.partner_2_name}</h1>
          <p className="text-lumaire-brown/60 mb-1">{client.wedding_date} • {client.venue_name} • {client.guest_count} Guests</p>
          <div className="flex gap-4 text-sm mt-2">
            <a href={`mailto:${client.email}`} className="text-lumaire-brown hover:underline">✉️ {client.email}</a>
            {client.phone && <span className="opacity-60">📞 {client.phone}</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/add-client" className="px-4 py-2 bg-lumaire-brown text-white text-sm hover:bg-lumaire-wine transition-colors">Documents</Link>
          <Link href="/vendors" className="px-4 py-2 border border-lumaire-brown/20 text-sm hover:bg-lumaire-brown hover:text-white transition-colors">Vendors</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          <div className="h-64"><NotesWidget clientId={client.id} initialNotes={client.notes} /></div>
          <WorkflowPicker clientId={client.id} templates={templates} />
          <Card title="Upcoming Tasks">
            <div className="space-y-3">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border border-lumaire-brown ${task.is_completed ? 'bg-lumaire-brown' : ''}`}></div>
                    <div className="flex-1">
                      <span className={`text-sm block ${task.is_completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
                      <span className="text-[10px] opacity-50 uppercase">{task.due_date}</span>
                    </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="opacity-50 text-sm italic">No open tasks.</p>}
            </div>
            <TaskAdder clientId={client.id} />
          </Card>
        </div>

        {/* RIGHT COLUMN - Passing the full CLIENT object here now */}
        <div className="lg:col-span-8">
           <TimelineEditor clientId={client.id} events={timeline} client={client} />
        </div>
      </div>
    </main>
  );
}
