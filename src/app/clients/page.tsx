import React from 'react';
import Link from 'next/link';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

interface Client {
  id: string;
  partner_1_name: string;
  partner_2_name: string;
  wedding_date: string;
  venue_name: string;
  status: string;
}

export default async function ClientList() {
  const { env } = getRequestContext();
  
  // FETCH REAL CLIENTS FROM DB
  const { results: clients } = await env.DB.prepare(`
    SELECT * FROM clients ORDER BY wedding_date ASC
  `).all<Client>();

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      <header className="flex justify-between items-end mb-12">
        <h1 className="text-4xl font-serif text-lumaire-brown">Client List</h1>
        <Link 
          href="/add-client" 
          className="px-6 py-3 bg-lumaire-brown text-white font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors"
        >
          + Add New Client
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {clients.length === 0 ? (
           <div className="p-12 text-center border border-dashed border-lumaire-brown/20">
             <p className="opacity-50">No clients yet. Add your first one!</p>
           </div>
        ) : (
          clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block group">
              <div className="bg-white p-6 border border-lumaire-tan/20 flex justify-between items-center hover:border-lumaire-brown/50 transition-colors shadow-sm">
                <div>
                  <h3 className="font-serif text-xl group-hover:text-lumaire-wine transition-colors">
                    {client.partner_1_name} & {client.partner_2_name}
                  </h3>
                  <p className="text-sm opacity-60 mt-1">
                    {client.wedding_date} • {client.venue_name}
                  </p>
                </div>
                <div>
                  <span className="px-3 py-1 bg-lumaire-ivory border border-lumaire-tan/20 text-xs uppercase tracking-widest">
                    {client.status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
