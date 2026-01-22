import React from 'react';
import Link from 'next/link';
import { TimelineBuilder } from '@/components/TimelineBuilder';

// This line fixes the error
export const runtime = 'edge';

// Mock Data
const client = { id: '1', couple: 'Sarah & James', date: 'Oct 12, 2026', venue: 'The Grand Hotel', guestCount: 150 };

export default function ClientDetail() {
  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      {/* Header */}
      <header className="mb-8">
        <Link href="/clients" className="text-sm text-lumaire-brown/60 hover:text-lumaire-brown mb-4 block">← Back to Client List</Link>
        <div className="flex justify-between items-end border-b border-lumaire-brown/10 pb-6">
          <div>
            <h1 className="text-5xl font-serif text-lumaire-brown mb-2">{client.couple}</h1>
            <p className="text-lg opacity-60">{client.date} • {client.venue} • {client.guestCount} Guests</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-lumaire-brown text-lumaire-brown hover:bg-lumaire-brown hover:text-white transition-colors">
              Documents
            </button>
            <button className="px-4 py-2 border border-lumaire-brown text-lumaire-brown hover:bg-lumaire-brown hover:text-white transition-colors">
              Vendors
            </button>
          </div>
        </div>
      </header>

      {/* Tabs / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Planning Details */}
        <div className="space-y-8">
           <div className="bg-white p-6 shadow-sm border border-lumaire-tan/20">
             <h3 className="font-serif text-xl mb-4">Quick Notes</h3>
             <textarea className="w-full h-32 p-3 border border-lumaire-brown/10 bg-lumaire-ivory/30 text-sm resize-none" placeholder="Type internal notes here..."></textarea>
           </div>
           
           <div className="bg-white p-6 shadow-sm border border-lumaire-tan/20">
             <h3 className="font-serif text-xl mb-4">Upcoming Tasks</h3>
             <ul className="space-y-3">
               <li className="flex items-center gap-3 text-sm">
                 <div className="w-4 h-4 border border-lumaire-brown rounded-full"></div>
                 <span>Finalize seating chart</span>
               </li>
               <li className="flex items-center gap-3 text-sm">
                 <div className="w-4 h-4 border border-lumaire-brown rounded-full"></div>
                 <span>Send music list to DJ</span>
               </li>
             </ul>
           </div>
        </div>

        {/* Right: The Timeline (Takes up 2 columns) */}
        <div className="lg:col-span-2">
          <TimelineBuilder />
        </div>
      </div>
    </main>
  );
}
