import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// --- TYPES (Strict Contracts for Data) ---
interface CountResult { count: number; }

interface Task { 
  id: string; 
  title: string; 
  category: string; 
  due_date: string; 
  is_completed: number; 
}

interface Wedding { 
  id: string; 
  partner_1_name: string; 
  partner_2_name: string; 
  wedding_date: string; 
  venue_name: string; 
}

interface Message {
  id: string;
  type: 'email' | 'call' | 'text';
  summary: string;
  date: string;
  partner_1_name: string; 
}

// --- DATA FETCHING ENGINE ---
async function getDashboardData() {
  const { env } = getRequestContext();
  
  // 1. High-Level View: Active Weddings Count
  const stats = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM clients WHERE status = 'active'
  `).first<CountResult>();

  // 2. Today's Tasks: Fetch pending items ordered by due date
  const { results: tasks } = await env.DB.prepare(`
    SELECT * FROM tasks WHERE is_completed = 0 ORDER BY due_date ASC LIMIT 5
  `).all<Task>();

  // 3. Upcoming Weddings: The next 3 events
  const { results: weddings } = await env.DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' ORDER BY wedding_date ASC LIMIT 3
  `).all<Wedding>();

  // 4. Recent Messages: Fetch logs and join with Client Names so we know who it's from
  const { results: messages } = await env.DB.prepare(`
    SELECT messages.id, messages.type, messages.summary, messages.date, clients.partner_1_name 
    FROM messages 
    LEFT JOIN clients ON messages.client_id = clients.id
    ORDER BY messages.date DESC 
    LIMIT 4
  `).all<Message>();

  // 5. Deadlines: Calculate the immediate next deadline
  const nextDeadline = tasks.length > 0 ? tasks[0].due_date : "No Deadlines";

  return {
    activeWeddings: stats?.count ?? 0,
    tasks: tasks || [],
    weddings: weddings || [],
    messages: messages || [], // This is the data you were missing
    nextDeadline,
    estimatedRevenue: (stats?.count ?? 0) * 4500 
  };
}

// --- THE UI COMPONENT ---
export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* 1. COMMAND CENTER HEADER */}
      <header className="flex justify-between items-end mb-12 border-b border-lumaire-brown/10 pb-6">
        <div>
          <p className="text-sm font-sans uppercase tracking-widest text-lumaire-brown/60 mb-2">Command Center</p>
          <h1 className="text-4xl font-serif text-lumaire-brown">Good Morning, Ismael</h1>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/add-client" 
            className="px-6 py-3 bg-lumaire-brown text-lumaire-ivory font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors"
          >
            + New Client
          </Link>
        </div>
      </header>

      {/* 2. HIGH-LEVEL BUSINESS VIEW (Stats Row) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Active Weddings</p>
          <p className="font-serif text-4xl">{data.activeWeddings}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Pending Tasks</p>
          <p className="font-serif text-4xl">{data.tasks.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Next Deadline</p>
          <p className="font-serif text-2xl truncate">{data.nextDeadline}</p> 
        </Card>
        <Card>
           <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Est. Revenue</p>
           <p className="font-serif text-4xl">${data.estimatedRevenue.toLocaleString()}</p>
        </Card>
      </div>

      {/* 3. MAIN GRID: TASKS, WEDDINGS, MESSAGES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: WORKFLOW (Tasks) */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Today's Tasks">
            {data.tasks.length === 0 ? (
              <p className="text-sm opacity-50 italic py-4">No urgent tasks. You are all caught up.</p>
            ) : (
              <div className="space-y-1">
                {data.tasks.map((task) => (
                  <div key={task.id} className="flex items-center group cursor-pointer p-3 hover:bg-lumaire-tan/10 rounded-sm transition-colors border-b border-lumaire-brown/5 last:border-0">
                    <div className="w-5 h-5 border border-lumaire-brown rounded-full mr-4 flex-shrink-0 flex items-center justify-center hover:bg-lumaire-brown/10"></div>
                    <div className="flex-1">
                      <p className="font-medium text-lumaire-brown">{task.title}</p>
                      <div className="flex gap-3 mt-1">
                         <span className="text-xs opacity-50 uppercase tracking-wide">{task.category}</span>
                         <span className="text-xs opacity-50">• Due {task.due_date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 text-center">
              <button className="text-xs font-bold uppercase tracking-widest hover:text-lumaire-wine transition-colors">View Workflow →</button>
            </div>
          </Card>
        </div>

        {/* Right Column: CONTEXT (Weddings & Messages) */}
        <div className="space-y-8">
          
          {/* Upcoming Weddings Feed */}
          <Card title="Upcoming Weddings">
            <div className="space-y-6">
              {data.weddings.map((wedding) => (
                <div key={wedding.id} className="pb-4 border-b border-lumaire-brown/10 last:border-0 last:pb-0">
                  <h4 className="font-serif text-lg">{wedding.partner_1_name} & {wedding.partner_2_name}</h4>
                  <p className="text-sm text-lumaire-brown/60 mb-2">{wedding.wedding_date} • {wedding.venue_name}</p>
                </div>
              ))}
              {data.weddings.length === 0 && <p className="text-sm opacity-50">No upcoming weddings.</p>}
            </div>
          </Card>

          {/* NEW FEATURE: Recent Messages Log */}
          <Card title="Recent Messages">
            <div className="space-y-4">
              {data.messages.length === 0 ? (
                 <p className="text-sm opacity-50">No new messages logged.</p>
              ) : (
                data.messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 items-start">
                    <div className="mt-1 w-6 h-6 flex items-center justify-center bg-lumaire-tan/20 rounded-full text-xs text-lumaire-brown">
                      {msg.type === 'email' ? '✉️' : msg.type === 'call' ? '📞' : '💬'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{msg.partner_1_name}</p>
                      <p className="text-sm text-lumaire-brown/70 leading-relaxed">"{msg.summary}"</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{msg.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-lumaire-brown/10">
               <button className="text-xs opacity-60 hover:opacity-100 transition-opacity">+ Log Communication</button>
            </div>
          </Card>

        </div>
      </div>
    </main>
  );
}
