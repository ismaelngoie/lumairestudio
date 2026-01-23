import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// --- TYPES ---
interface Client { 
  id: string; 
  partner_1_name: string; 
  partner_2_name: string; 
  wedding_date: string; 
  venue_name: string; 
  guest_count: number;
  email: string;
  phone: string;
  notes: string;
  status: string;
}

interface Task { 
  id: string; 
  title: string; 
  category: string; 
  due_date: string; 
  is_completed: number; 
}

interface Message {
  id: string;
  type: 'email' | 'call' | 'text';
  summary: string;
  date: string;
}

// --- DATA ENGINE ---
async function getClientData(id: string) {
  const { env } = getRequestContext();

  // 1. Fetch Client Details
  const client = await env.DB.prepare(`SELECT * FROM clients WHERE id = ?`).bind(id).first<Client>();

  if (!client) return null;

  // 2. Fetch Client's Tasks
  const { results: tasks } = await env.DB.prepare(`
    SELECT * FROM tasks WHERE client_id = ? ORDER BY due_date ASC
  `).bind(id).all<Task>();

  // 3. Fetch Client's Messages (Communication Log)
  const { results: messages } = await env.DB.prepare(`
    SELECT * FROM messages WHERE client_id = ? ORDER BY date DESC
  `).bind(id).all<Message>();

  // 4. Calculate Financials (Simple logic for now)
  const totalContract = client.guest_count * 150; // Approx $150/head budget managed
  const paidAmount = totalContract * 0.4; // 40% deposit paid

  return { client, tasks, messages, financials: { totalContract, paidAmount } };
}

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClientData(id);

  if (!data) return <div className="p-12 text-center">Client not found.</div>;

  const { client, tasks, messages, financials } = data;

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-lumaire-brown/10">
        <div>
          <Link href="/clients" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-2 block">← Back to List</Link>
          <h1 className="text-4xl font-serif text-lumaire-brown mb-2">{client.partner_1_name} & {client.partner_2_name}</h1>
          <p className="text-lumaire-brown/60">{client.wedding_date} • {client.venue_name} • {client.guest_count} Guests</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-lumaire-brown/20 text-sm hover:bg-lumaire-brown hover:text-white transition-colors">Edit Details</button>
          <button className="px-4 py-2 bg-lumaire-brown text-white text-sm hover:bg-lumaire-wine transition-colors">Send Email</button>
        </div>
      </div>

      {/* TOP ROW: FINANCIALS & STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Total Budget Mgmt</p>
          <p className="font-serif text-2xl">${financials.totalContract.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Amount Paid (Est)</p>
          <p className="font-serif text-2xl">${financials.paidAmount.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Status</p>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs uppercase tracking-widest rounded-sm">
            {client.status}
          </span>
        </Card>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT: COMMUNICATION LOG */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-lumaire-brown">Communication Log</h2>
          {messages.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-lumaire-brown/20 text-center opacity-50">
              No messages logged yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card key={msg.id}>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-lumaire-tan/20 flex items-center justify-center text-sm">
                      {msg.type === 'email' ? '✉️' : '📞'}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50 mb-1">{msg.date} • {msg.type}</p>
                      <p className="text-lumaire-brown">{msg.summary}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: TASKS */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl text-lumaire-brown">Open Tasks</h2>
          {tasks.length === 0 ? (
            <div className="p-6 bg-white border border-dashed border-lumaire-brown/20 text-center opacity-50">
              No tasks assigned.
            </div>
          ) : (
            <div className="bg-white border border-lumaire-tan/20">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border-b border-lumaire-tan/20 last:border-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border border-lumaire-brown ${task.is_completed ? 'bg-lumaire-brown' : ''}`}></div>
                    <span className={task.is_completed ? 'line-through opacity-50' : ''}>{task.title}</span>
                  </div>
                  <span className="text-xs opacity-50">{task.due_date}</span>
                </div>
              ))}
            </div>
          )}
           <button className="text-sm font-bold uppercase tracking-widest mt-2 opacity-60 hover:opacity-100">+ Add Task</button>
        </div>

      </div>
    </main>
  );
}
