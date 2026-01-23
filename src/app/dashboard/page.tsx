import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getRequestContext } from '@cloudflare/next-on-pages';
import TaskList from '@/components/dashboard/TaskList';

export const runtime = 'edge';

// --- TYPES ---
interface CountResult { count: number; }
interface SumResult { total: number; }
interface Task { id: string; title: string; category: string; due_date: string; is_completed: number; }
interface Wedding { id: string; partner_1_name: string; partner_2_name: string; wedding_date: string; venue_name: string; }
interface Message { id: string; type: 'email' | 'call' | 'text'; summary: string; date: string; partner_1_name: string; }

// --- DATA FETCHING ---
async function getDashboardData() {
  const { env } = getRequestContext();
  
  // 1. Stats (Active Clients)
  const stats = await env.DB.prepare("SELECT COUNT(*) as count FROM clients WHERE status = 'active'").first<CountResult>();
  
  // 2. Tasks (Pending High Priority)
  const { results: tasks } = await env.DB.prepare("SELECT * FROM tasks WHERE is_completed = 0 ORDER BY due_date ASC LIMIT 5").all<Task>();

  // 3. Upcoming Weddings
  const { results: weddings } = await env.DB.prepare("SELECT * FROM clients WHERE status = 'active' ORDER BY wedding_date ASC LIMIT 3").all<Wedding>();

  // 4. Recent Messages (Communication Log)
  const { results: messages } = await env.DB.prepare(`
    SELECT messages.id, messages.type, messages.summary, messages.date, clients.partner_1_name 
    FROM messages 
    LEFT JOIN clients ON messages.client_id = clients.id
    ORDER BY messages.date DESC 
    LIMIT 4
  `).all<Message>();

  // 5. Recent Activity (New Clients Feed)
  const { results: newClients } = await env.DB.prepare(`
    SELECT id, partner_1_name, partner_2_name, created_at FROM clients ORDER BY created_at DESC LIMIT 3
  `).all<any>();

  // 6. REAL FINANCIALS (Connected to Billing System)
  const totalRev = await env.DB.prepare("SELECT SUM(total_amount) as total FROM invoices").first<SumResult>();
  const pendingRev = await env.DB.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE status != 'Paid'").first<SumResult>();

  return {
    activeWeddings: stats?.count ?? 0,
    tasks: tasks || [],
    weddings: weddings || [],
    messages: messages || [],
    nextDeadline: tasks.length > 0 ? tasks[0].due_date : "None",
    newClients: newClients || [],
    // Financial Data
    revenue: totalRev?.total || 0,
    pendingRevenue: pendingRev?.total || 0
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* HEADER */}
      <header className="flex justify-between items-end mb-12 border-b border-lumaire-brown/10 pb-6">
        <div>
          <p className="text-sm font-sans uppercase tracking-widest text-lumaire-brown/60 mb-2">Command Center</p>
          <h1 className="text-4xl font-serif text-lumaire-brown">Good Morning, Ismael</h1>
        </div>
        <div className="flex gap-4">
           <Link href="/add-client" className="px-6 py-3 bg-lumaire-brown text-lumaire-ivory font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors">+ New Client</Link>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Link href="/clients">
          <Card>
            <p className="text-xs uppercase opacity-60 mb-2">Active Weddings</p>
            <p className="font-serif text-4xl">{data.activeWeddings}</p>
          </Card>
        </Link>
        
        <Card>
          <p className="text-xs uppercase opacity-60 mb-2">Pending Tasks</p>
          <p className="font-serif text-4xl">{data.tasks.length}</p>
        </Card>
        
        <Card>
          <p className="text-xs uppercase opacity-60 mb-2">Next Deadline</p>
          <p className="font-serif text-2xl truncate">{data.nextDeadline}</p>
        </Card>
        
        {/* REVENUE CARD (Linked to Billing) */}
        <Link href="/billing">
          <Card>
            <p className="text-xs uppercase opacity-60 mb-2">Total Revenue</p>
            <p className="font-serif text-4xl">${data.revenue.toLocaleString()}</p>
            {data.pendingRevenue > 0 && (
              <p className="text-[10px] text-orange-600 uppercase tracking-widest mt-2 font-bold">
                ${data.pendingRevenue.toLocaleString()} Pending
              </p>
            )}
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: TASKS & ACTIVITY */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Today's Tasks">
             <TaskList initialTasks={data.tasks} />
          </Card>
          
          {/* RECENT ACTIVITY BLOCK */}
          <div className="pt-8">
             <h3 className="font-serif text-2xl text-lumaire-brown mb-4">Recent Activity</h3>
             <div className="bg-white border border-lumaire-brown/10 p-6 space-y-6">
                {/* New Clients */}
                {data.newClients.map((c: any) => (
                  <div key={c.id} className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">
                      <span className="font-bold text-lumaire-brown">New Client:</span> {c.partner_1_name} & {c.partner_2_name} joined.
                    </p>
                  </div>
                ))}
                {/* Recent Messages */}
                {data.messages.slice(0, 2).map((m) => (
                   <div key={m.id} className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm">
                      <span className="font-bold text-lumaire-brown">Message:</span> "{m.summary}" from {m.partner_1_name}
                    </p>
                  </div>
                ))}
                {data.newClients.length === 0 && data.messages.length === 0 && (
                  <p className="text-sm opacity-50 italic">No recent activity.</p>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEDDINGS & MESSAGES */}
        <div className="space-y-8">
          <Card title="Upcoming Weddings">
            <div className="space-y-4">
              {data.weddings.map((w) => (
                <div key={w.id} className="pb-3 border-b border-lumaire-brown/5 last:border-0">
                  <h4 className="font-serif text-lg">{w.partner_1_name} & {w.partner_2_name}</h4>
                  <p className="text-xs opacity-60 uppercase tracking-widest">{w.wedding_date}</p>
                </div>
              ))}
              {data.weddings.length === 0 && <p className="text-sm opacity-50">No upcoming weddings.</p>}
            </div>
          </Card>

          <Card title="Recent Messages">
            <div className="space-y-4">
              {data.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 items-start group">
                   <div className="mt-1 w-6 h-6 flex items-center justify-center bg-lumaire-tan/20 rounded-full text-xs text-lumaire-brown">
                    {msg.type === 'email' ? '✉️' : msg.type === 'call' ? '📞' : '💬'}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-lumaire-brown">{msg.partner_1_name}</p>
                     <p className="text-sm opacity-70 leading-relaxed">"{msg.summary}"</p>
                     <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest">{msg.date}</p>
                   </div>
                </div>
              ))}
              {data.messages.length === 0 && <p className="text-sm opacity-50">No recent messages.</p>}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
