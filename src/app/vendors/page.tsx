import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

// Mock Data for the Rolodex 
const vendors = [
  { id: '1', name: 'Bloom & Wild', category: 'Florist', contact: 'Alice Green', email: 'alice@bloom.com', phone: '555-0123' },
  { id: '2', name: 'Captured Moments', category: 'Photographer', contact: 'Dan Smith', email: 'dan@photo.com', phone: '555-0199' },
  { id: '3', name: 'The Grand Feast', category: 'Catering', contact: 'Chef Mario', email: 'mario@feast.com', phone: '555-0888' },
  { id: '4', name: 'Soundwaves DJ', category: 'Music', contact: 'Sarah Jones', email: 'sarah@sound.com', phone: '555-0777' },
];

export default function VendorRolodex() {
  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
           <Link href="/dashboard" className="text-sm text-lumaire-brown/60 hover:text-lumaire-brown mb-2 block">← Back to Dashboard</Link>
           <h1 className="text-4xl font-serif text-lumaire-brown">Vendor Rolodex</h1>
        </div>
        <button className="px-6 py-3 bg-lumaire-brown text-lumaire-ivory font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors">
          + Add Vendor
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:border-lumaire-tan transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-xl text-lumaire-brown">{vendor.name}</h3>
              <span className="text-xs uppercase tracking-widest bg-lumaire-tan/20 px-2 py-1 rounded-sm text-lumaire-brown">
                {vendor.category}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-lumaire-brown/80">
              <p><span className="opacity-50">Contact:</span> {vendor.contact}</p>
              <p><span className="opacity-50">Email:</span> {vendor.email}</p>
              <p><span className="opacity-50">Phone:</span> {vendor.phone}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-lumaire-brown/10 flex gap-4">
              <a href={`mailto:${vendor.email}`} className="text-xs font-bold hover:text-lumaire-wine">EMAIL</a>
              <a href={`tel:${vendor.phone}`} className="text-xs font-bold hover:text-lumaire-wine">CALL</a>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
