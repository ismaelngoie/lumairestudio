'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorTeam({ clientId, assigned, allVendors }: { clientId: string, assigned: any[], allVendors: any[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [newAssign, setNewAssign] = useState({ vendor_id: '', role: '' });

  const handleAssign = async () => {
    if (!newAssign.vendor_id || !newAssign.role) return;
    await fetch('/api/vendors/assign', {
      method: 'POST',
      body: JSON.stringify({ ...newAssign, client_id: clientId })
    });
    setNewAssign({ vendor_id: '', role: '' });
    setIsAdding(false);
    router.refresh();
  };

  const removeAssign = async (id: string) => {
    if(!confirm("Remove this vendor from the wedding?")) return;
    await fetch(`/api/vendors/assign/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="bg-white border border-lumaire-tan/20 p-6 rounded-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-xl text-lumaire-brown">Vendor Team</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="text-xs uppercase font-bold text-lumaire-brown hover:text-lumaire-wine">
          {isAdding ? 'Cancel' : '+ Add Vendor'}
        </button>
      </div>

      {/* ADD FORM */}
      {isAdding && (
        <div className="bg-lumaire-tan/10 p-4 mb-6 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-2">
          <select 
            className="w-full p-2 text-sm bg-white border border-lumaire-tan/20"
            value={newAssign.vendor_id}
            onChange={e => setNewAssign({...newAssign, vendor_id: e.target.value})}
          >
            <option value="">Select a Vendor...</option>
            {allVendors.map(v => (
              <option key={v.id} value={v.id}>{v.company} ({v.category})</option>
            ))}
          </select>
          <input 
            className="w-full p-2 text-sm bg-white border border-lumaire-tan/20"
            placeholder="Role (e.g., Main Photographer)"
            value={newAssign.role}
            onChange={e => setNewAssign({...newAssign, role: e.target.value})}
          />
          <button onClick={handleAssign} className="w-full bg-lumaire-brown text-white py-2 text-xs uppercase tracking-widest hover:bg-lumaire-wine">
            Assign to Wedding
          </button>
        </div>
      )}

      {/* TEAM LIST */}
      <div className="space-y-4">
        {assigned.map((a) => (
          <div key={a.id} className="flex justify-between items-start group">
            <div>
              <p className="font-bold text-sm text-lumaire-brown">{a.company}</p>
              <p className="text-xs opacity-60 uppercase tracking-wide mb-1">{a.role}</p>
              <div className="text-xs opacity-50">
                 <a href={`mailto:${a.email}`} className="hover:text-lumaire-brown mr-3">✉️ Email</a>
                 <a href={`tel:${a.phone}`} className="hover:text-lumaire-brown">📞 Call</a>
              </div>
            </div>
            <button 
              onClick={() => removeAssign(a.id)}
              className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 text-xs uppercase font-bold transition-all"
            >
              Remove
            </button>
          </div>
        ))}
        {assigned.length === 0 && <p className="text-sm opacity-50 italic">No vendors assigned yet.</p>}
      </div>
    </div>
  );
}
