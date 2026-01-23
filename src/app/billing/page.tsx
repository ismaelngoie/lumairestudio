'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const runtime = 'edge';

export default function BillingDashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });

  useEffect(() => {
    fetch('/api/invoices').then(res => res.json()).then((data: any[]) => {
      setInvoices(data);
      // Calculate Stats
      const total = data.reduce((sum, inv) => sum + inv.total_amount, 0);
      const paid = data.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.total_amount, 0);
      const pending = data.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.total_amount, 0);
      setStats({ total, paid, pending });
    });
  }, []);

  const markPaid = async (id: string) => {
    if(!confirm("Mark this invoice as PAID?")) return;
    await fetch(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Paid' }) });
    // Optimistic Update
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'Paid' } : i));
  };

  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      <header className="flex justify-between items-end mb-12 border-b border-lumaire-brown/10 pb-6">
        <div>
           <p className="text-sm font-sans uppercase tracking-widest text-lumaire-brown/60 mb-2">Finance</p>
           <h1 className="text-4xl font-serif text-lumaire-brown">Financial Overview</h1>
        </div>
        <Link href="/billing/new" className="px-6 py-3 bg-lumaire-brown text-white font-sans text-sm tracking-wide hover:bg-lumaire-wine transition-colors">
          + New Invoice
        </Link>
      </header>

      {/* FINANCIAL REPORTING (STATS) */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 border border-lumaire-tan/20">
           <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Total Revenue</p>
           <p className="font-serif text-4xl text-lumaire-brown">${stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 border border-lumaire-tan/20">
           <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-green-600">Collected</p>
           <p className="font-serif text-4xl text-green-700">${stats.paid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 border border-lumaire-tan/20">
           <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-orange-600">Pending</p>
           <p className="font-serif text-4xl text-orange-700">${stats.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* INVOICE LIST */}
      <div className="bg-white border border-lumaire-tan/20">
        <div className="grid grid-cols-5 p-4 bg-lumaire-tan/5 border-b border-lumaire-tan/20 text-xs uppercase tracking-widest font-bold text-lumaire-brown/60">
          <span>Number</span>
          <span className="col-span-2">Client</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {invoices.map((inv) => (
          <div key={inv.id} className="grid grid-cols-5 p-4 border-b border-lumaire-tan/10 items-center hover:bg-lumaire-tan/5 transition-colors">
            <span className="font-mono text-sm opacity-60">{inv.number}</span>
            <span className="col-span-2 font-serif text-lumaire-brown">{inv.partner_1_name} & {inv.partner_2_name}</span>
            <span className="font-bold">${inv.total_amount.toLocaleString()}</span>
            <div className="flex justify-between items-center pr-4">
              <span className={`text-xs uppercase tracking-widest px-2 py-1 rounded-sm ${
                inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                inv.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-800'
              }`}>
                {inv.status}
              </span>
              {inv.status !== 'Paid' && (
                <button onClick={() => markPaid(inv.id)} className="text-[10px] uppercase font-bold text-lumaire-brown underline hover:text-green-600">
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        ))}
        {invoices.length === 0 && <div className="p-8 text-center opacity-50">No invoices found.</div>}
      </div>
    </main>
  );
}
