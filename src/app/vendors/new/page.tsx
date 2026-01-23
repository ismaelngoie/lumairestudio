'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const runtime = 'edge';

export default function NewVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Photography', name: '', company: '', email: '', phone: '', website: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/vendors', { method: 'POST', body: JSON.stringify(formData) });
    router.push('/vendors');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8 flex justify-center items-center">
      <div className="w-full max-w-xl bg-white p-12 border border-lumaire-tan/30 shadow-sm">
        <h1 className="font-serif text-3xl text-lumaire-brown mb-6">Add New Contact</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Category</label>
              <select className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {['Photography','Videography','Floral','Catering','Music','Venue','Planner','Stationery','Attire','Beauty','Transport'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
             </div>
             <div>
               <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Company Name</label>
               <input required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
             </div>
          </div>
          <div>
             <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Contact Name</label>
             <input className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
               <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Email</label>
               <input type="email" required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Phone</label>
               <input className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div>
             <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Website</label>
             <input className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-lumaire-brown text-white py-4 hover:bg-lumaire-wine transition-colors">
              {loading ? 'SAVING...' : 'SAVE VENDOR'}
            </button>
            <Link href="/vendors" className="px-8 py-4 border border-lumaire-brown/20 hover:bg-lumaire-brown/5">CANCEL</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
