'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TimelineEditor({ clientId, events }: { clientId: string, events: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({ start_time: '', activity: '' });

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

  const removeEvent = async (id: string) => {
    await fetch(`/api/timeline/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="font-serif text-3xl text-lumaire-brown">Wedding Day Timeline</h2>
        <button className="text-xs uppercase underline opacity-60 hover:opacity-100">Export PDF</button>
      </div>

      {/* TIMELINE VISUALIZATION */}
      <div className="relative border-l-2 border-lumaire-tan/30 ml-3 space-y-8 pl-8 py-2">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* The Dot */}
            <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-lumaire-tan border-4 border-lumaire-ivory shadow-sm"></div>
            
            <div className="bg-white p-6 border border-lumaire-tan/20 shadow-sm relative hover:border-lumaire-brown/30 transition-colors">
              <button 
                onClick={() => removeEvent(evt.id)}
                className="absolute top-4 right-4 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 uppercase tracking-widest hover:text-red-600 transition-all"
              >
                Remove
              </button>
              <span className="block font-bold text-lumaire-brown mb-1">{evt.start_time}</span>
              <span className="text-lg font-serif text-lumaire-brown/90">{evt.activity}</span>
            </div>
          </div>
        ))}

        {events.length === 0 && <p className="opacity-40 italic">No events planned yet.</p>}
      </div>

      {/* ADD EVENT FORM */}
      <div className="bg-lumaire-tan/10 p-6 rounded-sm mt-8">
        <h4 className="font-serif text-lg text-lumaire-brown mb-4">Add Event</h4>
        <div className="flex gap-4">
          <input 
            type="time" 
            className="p-3 border border-lumaire-tan/20 w-32 bg-white"
            value={newEvent.start_time}
            onChange={e => setNewEvent({...newEvent, start_time: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Activity Name (e.g., Cake Cutting)" 
            className="flex-1 p-3 border border-lumaire-tan/20 bg-white"
            value={newEvent.activity}
            onChange={e => setNewEvent({...newEvent, activity: e.target.value})}
          />
          <button 
            onClick={addEvent}
            disabled={loading}
            className="bg-lumaire-brown text-white px-6 py-3 text-sm hover:bg-lumaire-wine transition-colors"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
