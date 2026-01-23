'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partner_1_name: '',
    partner_2_name: '',
    email: '',
    wedding_date: '',
    venue_name: '',
    guest_count: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push('/clients'); 
        router.refresh();
      }
    } catch (error) {
      alert('Error saving client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white p-12 border border-lumaire-tan/30 shadow-sm">
        <h1 className="font-serif text-3xl text-lumaire-brown mb-2">Add New Client</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Partner 1</label>
              <input required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 outline-none"
                value={formData.partner_1_name} onChange={e => setFormData({...formData, partner_1_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Partner 2</label>
              <input required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 outline-none"
                value={formData.partner_2_name} onChange={e => setFormData({...formData, partner_2_name: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Date</label>
              <input type="date" required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 outline-none"
                value={formData.wedding_date} onChange={e => setFormData({...formData, wedding_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Venue</label>
              <input required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 outline-none"
                value={formData.venue_name} onChange={e => setFormData({...formData, venue_name: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Email</label>
            <input type="email" required className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-lumaire-brown text-white py-4 hover:bg-lumaire-wine transition-colors">
            {loading ? 'SAVING...' : 'CREATE CLIENT'}
          </button>
        </form>
      </div>
    </main>
  );
}
