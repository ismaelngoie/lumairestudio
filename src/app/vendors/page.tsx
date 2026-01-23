import React from 'react';
import Link from 'next/link';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export default async function VendorRolodex() {
  const { env } = getRequestContext();
  const { results: vendors } = await env.DB.prepare(`SELECT * FROM vendors ORDER BY category ASC, company ASC`).all<any>();

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      <header className="flex justify-between items-end mb-12 border-b border-lumaire-brown/10 pb-6">
        <div>
           <p className="text-sm font-sans uppercase tracking-widest text-lumaire-brown/60 mb-2">Network</p>
           <h1 className="text-4xl font-serif text-lumaire-brown">Vendor Rolodex</h1>
        </div>
        <Link href="/vendors/new" className="px-6 py-3 bg-lumaire-brown text-white font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors">
          + Add Contact
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white p-6 border border-lumaire-tan/20 hover:border-lumaire-brown/40 transition-colors group">
             <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] uppercase tracking-widest bg-lumaire-tan/10 px-2 py-1 text-lumaire-brown rounded-sm">{vendor.category}</span>
               <Link href={`/vendors/${vendor.id}`} className="text-lumaire-brown/20 group-hover:text-lumaire-brown transition-colors">✎ Edit</Link>
             </div>
             <h3 className="font-serif text-xl text-lumaire-brown mb-1">{vendor.company}</h3>
             <p className="text-sm text-lumaire-brown/60 mb-4">{vendor.name}</p>
             
             <div className="space-y-2 text-sm border-t border-lumaire-brown/5 pt-4">
               <a href={`mailto:${vendor.email}`} className="block hover:text-lumaire-wine transition-colors">✉️ {vendor.email}</a>
               <a href={`tel:${vendor.phone}`} className="block hover:text-lumaire-wine transition-colors">📞 {vendor.phone}</a>
               {vendor.website && (
                 <a href={`https://${vendor.website}`} target="_blank" className="block opacity-60 hover:opacity-100 hover:underline">🌐 {vendor.website}</a>
               )}
             </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="col-span-3 text-center py-12 opacity-50 border border-dashed border-lumaire-brown/20">
            No vendors in your rolodex yet. Add your first contact!
          </div>
        )}
      </div>
    </main>
  );
}
