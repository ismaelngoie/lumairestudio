'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export const runtime = 'edge';

export default function VendorProfile() {
  const router = useRouter();
  const params = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    // Fetch Vendor Data
    fetch(`/api/vendors/${params.id}`).then(res => res.json()).then(data => {
      setVendor(data);
      setFormData(data);
      setNotes(data.notes || '');
      setLoading(false);
    });
  }, [params.id]);

  const handleSaveDetails = async () => {
    await fetch(`/api/vendors/${params.id}`, { method: 'PATCH', body: JSON.stringify(formData) });
    setVendor(formData);
    setIsEditing(false);
    router.refresh();
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await fetch(`/api/vendors/${params.id}`, { method: 'PATCH', body: JSON.stringify({ notes }) });
    setSavingNotes(false);
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!vendor) return <div className="p-12 text-center">Vendor not found.</div>;

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <Link href="/vendors" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-6 block">← Back to Rolodex</Link>
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-lumaire-brown/10">
          <div>
            <span className="text-xs uppercase tracking-widest bg-lumaire-tan/20 px-2 py-1 text-lumaire-brown rounded-sm mb-2 inline-block">
              {vendor.category}
            </span>
            <h1 className="text-4xl font-serif text-lumaire-brown mb-1">{vendor.company}</h1>
            <p className="text-lumaire-brown/60">{vendor.name}</p>
          </div>
          <button 
            onClick={() => isEditing ? handleSaveDetails() : setIsEditing(true)}
            className="px-6 py-2 bg-lumaire-brown text-white text-sm hover:bg-lumaire-wine transition-colors uppercase tracking-widest"
          >
            {isEditing ? 'Save Changes' : 'Edit Contact'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* LEFT: Contact Details (Editable) */}
          <div className="space-y-6">
            <h3 className="font-serif text-xl text-lumaire-brown">Contact Information</h3>
            <div className="bg-white p-6 border border-lumaire-tan/20 space-y-4">
              {isEditing ? (
                <>
                  <input className="w-full p-2 border border-lumaire-tan/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contact Name" />
                  <input className="w-full p-2 border border-lumaire-tan/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />
                  <input className="w-full p-2 border border-lumaire-tan/20" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" />
                  <input className="w-full p-2 border border-lumaire-tan/20" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="Website" />
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-lumaire-brown/5 pb-2">
                    <span className="opacity-50 text-sm">Email</span>
                    <a href={`mailto:${vendor.email}`} className="text-lumaire-brown hover:underline">{vendor.email}</a>
                  </div>
                  <div className="flex justify-between border-b border-lumaire-brown/5 pb-2">
                    <span className="opacity-50 text-sm">Phone</span>
                    <a href={`tel:${vendor.phone}`} className="text-lumaire-brown hover:underline">{vendor.phone}</a>
                  </div>
                  <div className="flex justify-between border-b border-lumaire-brown/5 pb-2">
                    <span className="opacity-50 text-sm">Website</span>
                    <a href={`https://${vendor.website}`} target="_blank" className="text-lumaire-brown hover:underline">{vendor.website}</a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Communication Notes (The Missing Feature) */}
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-serif text-xl text-lumaire-brown">Vendor Notes & Log</h3>
                {savingNotes && <span className="text-xs text-green-600 uppercase tracking-widest fade-in">Saved ✓</span>}
             </div>
             <div className="bg-white border border-lumaire-brown/10 p-4 h-64 flex flex-col">
                <textarea 
                  className="flex-1 w-full resize-none outline-none text-sm text-lumaire-brown/80 leading-relaxed bg-transparent placeholder:opacity-30"
                  placeholder="Log calls, pricing notes, or feedback here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes} // Auto-save on click away
                />
                <div className="pt-2 border-t border-lumaire-brown/5 text-[10px] opacity-40 uppercase tracking-widest text-right">
                  Private Internal Notes
                </div>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}
