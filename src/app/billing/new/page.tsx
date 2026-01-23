'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const runtime = 'edge';

export default function NewInvoice() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: '',
    due_date: '',
    items: [{ desc: '', amount: 0 }]
  });

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then((data: any) => { // FIX: Explicitly cast data
        if (Array.isArray(data)) {
           setClients(data);
        }
      });
  }, []);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { desc: '', amount: 0 }] });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    // @ts-ignore
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.due_date) return alert("Please fill all fields");
    setLoading(true);
    await fetch('/api/invoices', { method: 'POST', body: JSON.stringify(formData) });
    router.push('/billing');
  };

  const total = formData.items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8 flex justify-center">
      <div className="w-full max-w-2xl bg-white p-12 border border-lumaire-tan/30 shadow-sm">
        <h1 className="font-serif text-3xl text-lumaire-brown mb-8">Create New Invoice</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Client</label>
              <select 
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20"
                onChange={e => setFormData({...formData, client_id: e.target.value})}
              >
                <option value="">Select Client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.partner_1_name} & {c.partner_2_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-2">Due Date</label>
              <input 
                type="date" 
                className="w-full p-3 bg-lumaire-ivory border border-lumaire-tan/20"
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-lumaire-brown/10 pt-6">
            <label className="block text-xs uppercase tracking-widest text-lumaire-brown mb-4">Line Items</label>
            {formData.items.map((item, i) => (
              <div key={i} className="flex gap-4 mb-3">
                <input 
                  className="flex-1 p-3 bg-lumaire-ivory border border-lumaire-tan/20" 
                  placeholder="Service Description"
                  value={item.desc}
                  onChange={e => updateItem(i, 'desc', e.target.value)}
                />
                <input 
                  type="number"
                  className="w-32 p-3 bg-lumaire-ivory border border-lumaire-tan/20" 
                  placeholder="$0.00"
                  value={item.amount}
                  onChange={e => updateItem(i, 'amount', e.target.value)}
                />
              </div>
            ))}
            <button onClick={addItem} className="text-xs font-bold text-lumaire-brown hover:underline">+ Add Item</button>
          </div>

          <div className="flex justify-between items-end border-t border-lumaire-brown/10 pt-6 mt-6">
             <div>
                <p className="text-xs uppercase opacity-50">Total Amount</p>
                <p className="font-serif text-3xl text-lumaire-brown">${total.toLocaleString()}</p>
             </div>
             <div className="flex gap-4">
               <Link href="/billing" className="px-6 py-3 border border-lumaire-brown/20 text-sm">Cancel</Link>
               <button 
                 onClick={handleSubmit} 
                 disabled={loading}
                 className="px-8 py-3 bg-lumaire-brown text-white text-sm hover:bg-lumaire-wine transition-colors"
               >
                 {loading ? 'Creating...' : 'Create Invoice'}
               </button>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
