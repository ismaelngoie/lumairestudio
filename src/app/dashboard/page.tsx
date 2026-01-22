import React from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

// Mock Data (We will replace this with real DB calls later)
const todaysTasks = [
  { id: '1', title: 'Confirm florist for Johnson wedding', time: '10:00 AM', completed: false },
  { id: '2', title: 'Send invoice to Miller couple', time: '11:30 AM', completed: false },
  { id: '3', title: 'Review catering contract', time: '2:00 PM', completed: true },
];

const upcomingWeddings = [
  { id: '1', couple: 'Sarah & James', date: 'Oct 12, 2026', daysLeft: 14, venue: 'The Grand Hotel' },
  { id: '2', couple: 'Elena & Michael', date: 'Nov 04, 2026', daysLeft: 36, venue: 'Seaside Pavilion' },
  { id: '3', couple: 'David & Tom', date: 'Dec 15, 2026', daysLeft: 78, venue: 'City Loft' },
];

export default function Dashboard() {
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
            href="/clients/new" 
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
          <p className="font-serif text-4xl">8</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Pending Tasks</p>
          <p className="font-serif text-4xl">12</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Next Event</p>
          <p className="font-serif text-2xl">14 Days</p>
        </Card>
        <Card>
           <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Revenue (M)</p>
           <p className="font-serif text-4xl">$12k</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Tasks (Takes up 2 spaces) */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Today's Focus">
            <div className="space-y-4">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center group cursor-pointer p-2 hover:bg-lumaire-tan/10 rounded-sm transition-colors">
                  <div className={`w-5 h-5 border border-lumaire-brown rounded-full mr-4 flex items-center justify-center ${task.completed ? 'bg-lumaire-brown' : ''}`}>
                    {task.completed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <p className={`font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                    <p className="text-xs opacity-50">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-lumaire-brown/10 text-center">
              <button className="text-sm font-medium hover:text-lumaire-wine transition-colors">View All Tasks →</button>
            </div>
          </Card>

          {/* Business Health */}
          <Card title="Recent Activity">
            <div className="text-sm space-y-3 opacity-80">
              <p>• <span className="font-bold">Sarah & James</span> viewed their timeline.</p>
              <p>• New contract signed by <span className="font-bold">Elena & Michael</span>.</p>
              <p>• Payment received from <span className="font-bold">David & Tom</span>.</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Weddings */}
        <div className="space-y-8">
          <Card title="Upcoming Weddings">
            <div className="space-y-6">
              {upcomingWeddings.map((wedding) => (
                <div key={wedding.id} className="pb-4 border-b border-lumaire-brown/10 last:border-0 last:pb-0">
                  <h4 className="font-serif text-lg">{wedding.couple}</h4>
                  <p className="text-sm text-lumaire-brown/60 mb-2">{wedding.date} • {wedding.venue}</p>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="bg-lumaire-tan/20 px-2 py-1 rounded-sm text-lumaire-brown">{wedding.daysLeft} days to go</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/clients" className="block w-full py-3 border border-lumaire-brown/20 text-center text-sm hover:bg-lumaire-brown hover:text-white transition-colors">
                View All Clients
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </main>
  );
}
