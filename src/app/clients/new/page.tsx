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
        router.push('/clients'); // Go back to list on success
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
        <p className="text-lumaire-brown/60 mb-8">Enter the details for the upcoming wedding.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Partner 1</label>
              <input 
                required
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
                value={formData.partner_1_name}
                onChange={e => setFormData({...formData, partner_1_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Partner 2</label>
              <input 
                required
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
                value={formData.partner_2_name}
                onChange={e => setFormData({...formData, partner_2_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Wedding Date</label>
              <input 
                type="date"
                required
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
                value={formData.wedding_date}
                onChange={e => setFormData({...formData, wedding_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Guest Count (Est)</label>
              <input 
                type="number"
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
                value={formData.guest_count}
                onChange={e => setFormData({...formData, guest_count: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Venue Name</label>
            <input 
              required
              className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
              value={formData.venue_name}
              onChange={e => setFormData({...formData, venue_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Client Email</label>
            <input 
              type="email"
              required
              className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20 focus:border-lumaire-brown outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-lumaire-brown text-white py-4 font-sans tracking-widest hover:bg-lumaire-wine transition-colors"
            >
              {loading ? 'SAVING...' : 'CREATE CLIENT PROFILE'}
            </button>
            <Link href="/clients" className="px-8 py-4 border border-lumaire-brown/20 hover:bg-lumaire-brown/5">
              CANCEL
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
