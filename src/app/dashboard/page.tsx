import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

// FETCH DATA FROM DB
async function getDashboardData() {
  const { env } = getRequestContext();
  
  // 1. Get Active Weddings Count
  const stats = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM clients WHERE status = 'active'
  `).first();

  // 2. Get Recent Tasks (Real data from DB)
  const { results: tasks } = await env.DB.prepare(`
    SELECT * FROM tasks WHERE is_completed = 0 ORDER BY due_date ASC LIMIT 5
  `).all();

  // 3. Get Upcoming Weddings (Real data from DB)
  const { results: weddings } = await env.DB.prepare(`
    SELECT * FROM clients WHERE status = 'active' ORDER BY wedding_date ASC LIMIT 3
  `).all();

  return {
    activeWeddings: stats?.count || 0,
    tasks,
    weddings
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-12 border-b border-lumaire-brown/10 pb-6">
        <div>
          <p className="text-sm font-sans uppercase tracking-widest text-lumaire-brown/60 mb-2">Overview</p>
          <h1 className="text-4xl font-serif text-lumaire-brown">Good Morning, Ismael</h1>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/clients" // We will build the Create page next
            className="px-6 py-3 bg-lumaire-brown text-lumaire-ivory font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors"
          >
            + New Client
          </Link>
        </div>
      </header>

      {/* Stats Row */}
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
          <p className="font-serif text-2xl">2 Days</p> 
        </Card>
        <Card>
           <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Revenue (Est)</p>
           <p className="font-serif text-4xl">$12k</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Today's Focus">
            {data.tasks.length === 0 ? (
              <p className="text-sm opacity-50 italic">No pending tasks. Great job!</p>
            ) : (
              <div className="space-y-4">
                {data.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center group cursor-pointer p-2 hover:bg-lumaire-tan/10 rounded-sm transition-colors">
                    <div className="w-5 h-5 border border-lumaire-brown rounded-full mr-4 flex items-center justify-center"></div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs opacity-50">Due: {task.due_date} • {task.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-lumaire-brown/10 text-center">
              <button className="text-sm font-medium hover:text-lumaire-wine transition-colors">View All Tasks →</button>
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Weddings */}
        <div className="space-y-8">
          <Card title="Upcoming Weddings">
            <div className="space-y-6">
              {data.weddings.map((wedding: any) => (
                <div key={wedding.id} className="pb-4 border-b border-lumaire-brown/10 last:border-0 last:pb-0">
                  <h4 className="font-serif text-lg">{wedding.partner_1_name} & {wedding.partner_2_name}</h4>
                  <p className="text-sm text-lumaire-brown/60 mb-2">{wedding.wedding_date} • {wedding.venue_name}</p>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="bg-lumaire-tan/20 px-2 py-1 rounded-sm text-lumaire-brown">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </main>
  );
}
