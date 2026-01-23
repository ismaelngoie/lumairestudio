'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TimelineEditor({ clientId, events, client }: { clientId: string, events: any[], client?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({ start_time: '', activity: '' });

  // 1. ADD EVENT
  const addEvent = async () => {
    if (!newEvent.start_time || !newEvent.activity) return;
    setLoading(true);
    await fetch('/api/timeline', {
      method: 'POST',
      body: JSON.stringify({ ...newEvent, client_id: clientId })
    });
    setNewEvent({ start_time: '', activity: '' });
    setLoading(false);
    router.refresh();
  };

  // 2. REMOVE EVENT
  const removeEvent = async (id: string) => {
    if(!confirm("Remove this event?")) return;
    await fetch(`/api/timeline/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  // 3. UPDATE EVENT (Time/Activity)
  const updateEvent = async (id: string, field: 'start_time' | 'activity', value: string) => {
    await fetch(`/api/timeline/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify({ [field]: value }) 
    });
    router.refresh();
  };

  // 4. LOAD TEMPLATE
  const loadTemplate = async () => {
    if(!confirm("Load template?")) return;
    setLoading(true);
    await fetch('/api/timeline/template', { method: 'POST', body: JSON.stringify({ client_id: clientId }) });
    setLoading(false);
    router.refresh();
  };

  // 5. EXPORT TO PDF (The Million Dollar Feature)
  const exportToPDF = () => {
    if (!client) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Please allow popups to print.");

    // Generate the "Million Dollar" HTML
    const html = `
      <html>
        <head>
          <title>Timeline - ${client.partner_1_name} & ${client.partner_2_name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap');
            body { 
              font-family: 'Lato', sans-serif; 
              background: #fff; 
              color: #544541; 
              padding: 40px; 
            }
            .header { text-align: center; margin-bottom: 60px; padding-bottom: 20px; border-bottom: 1px solid rgba(84, 69, 65, 0.2); }
            h1 { font-family: 'Playfair Display', serif; font-size: 42px; margin: 0; letter-spacing: -0.5px; }
            .subtitle { text-transform: uppercase; letter-spacing: 3px; font-size: 12px; margin-top: 10px; opacity: 0.7; }
            
            .timeline { position: relative; max-width: 600px; margin: 0 auto; }
            .event { display: flex; margin-bottom: 30px; position: relative; }
            .time { width: 100px; font-weight: bold; font-size: 16px; text-align: right; padding-right: 30px; }
            .dot { width: 12px; height: 12px; background: #544541; border-radius: 50%; position: absolute; left: 100px; top: 4px; transform: translateX(-50%); }
            .line { position: absolute; left: 100px; top: 16px; bottom: -34px; width: 1px; background: rgba(84, 69, 65, 0.2); transform: translateX(-50%); }
            .event:last-child .line { display: none; }
            .details { flex: 1; padding-left: 30px; }
            .activity { font-family: 'Playfair Display', serif; font-size: 22px; margin: 0; }
            .notes { font-style: italic; opacity: 0.6; font-size: 14px; margin-top: 4px; }
            
            @media print {
              @page { margin: 1cm; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${client.partner_1_name} & ${client.partner_2_name}</h1>
            <div class="subtitle">${client.wedding_date} • ${client.venue_name}</div>
          </div>
          <div class="timeline">
            ${events.map(evt => `
              <div class="event">
                <div class="time">${evt.start_time}</div>
                <div class="line"></div>
                <div class="dot"></div>
                <div class="details">
                  <div class="activity">${evt.activity}</div>
                  ${evt.notes ? `<div class="notes">${evt.notes}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="font-serif text-3xl text-lumaire-brown">Wedding Day Timeline</h2>
        <div className="flex gap-3">
          {events.length === 0 && (
             <button onClick={loadTemplate} className="text-xs uppercase tracking-widest border border-lumaire-brown/30 px-3 py-1 hover:bg-lumaire-brown hover:text-white transition-colors">
               + Load Template
             </button>
          )}
          {/* THE NEW PDF BUTTON */}
          <button 
            onClick={exportToPDF} 
            className="text-xs uppercase tracking-widest bg-lumaire-brown text-white px-4 py-2 hover:bg-lumaire-wine transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* TIMELINE VISUALIZATION (Interactive) */}
      <div className="relative border-l-2 border-lumaire-tan/30 ml-3 space-y-8 pl-8 py-2">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-lumaire-tan border-4 border-lumaire-ivory shadow-sm"></div>
            
            <div className="bg-white p-6 border border-lumaire-tan/20 shadow-sm relative hover:border-lumaire-brown/30 transition-colors group">
              <input 
                type="time" 
                defaultValue={evt.start_time}
                onBlur={(e) => updateEvent(evt.id, 'start_time', e.target.value)}
                className="block font-bold text-lumaire-brown mb-1 bg-transparent border-b border-transparent hover:border-lumaire-brown/20 focus:border-lumaire-brown outline-none transition-colors cursor-pointer"
              />
              <input 
                defaultValue={evt.activity}
                onBlur={(e) => updateEvent(evt.id, 'activity', e.target.value)}
                className="w-full text-lg font-serif text-lumaire-brown/90 bg-transparent border-b border-transparent hover:border-lumaire-brown/20 focus:border-lumaire-brown outline-none transition-colors"
              />
              <button onClick={() => removeEvent(evt.id)} className="absolute top-4 right-4 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 uppercase tracking-widest hover:text-red-600 transition-all">Remove</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="opacity-40 italic">No events planned yet.</p>}
      </div>

      {/* ADD EVENT FORM */}
      <div className="bg-lumaire-tan/10 p-6 rounded-sm mt-8">
        <h4 className="font-serif text-lg text-lumaire-brown mb-4">Add Event</h4>
        <div className="flex gap-4">
          <input type="time" className="p-3 border border-lumaire-tan/20 w-32 bg-white" value={newEvent.start_time} onChange={e => setNewEvent({...newEvent, start_time: e.target.value})} />
          <input type="text" placeholder="Activity Name" className="flex-1 p-3 border border-lumaire-tan/20 bg-white" value={newEvent.activity} onChange={e => setNewEvent({...newEvent, activity: e.target.value})} />
          <button onClick={addEvent} disabled={loading} className="bg-lumaire-brown text-white px-6 py-3 text-sm hover:bg-lumaire-wine transition-colors">{loading ? '...' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
}
