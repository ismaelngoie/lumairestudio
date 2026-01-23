'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotesWidget({ clientId, initialNotes }: { clientId: string, initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to save notes");
    } finally {
      setTimeout(() => setIsSaving(false), 500); // Show "Saved" for a moment
    }
  };

  return (
    <div className="bg-white border border-lumaire-brown/10 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-serif text-xl text-lumaire-brown">Internal Notes</h3>
        {isSaving && <span className="text-xs text-green-600 uppercase tracking-widest font-bold fade-in">Saved ✓</span>}
      </div>
      <textarea 
        className="flex-1 w-full resize-none outline-none text-sm text-lumaire-brown/80 leading-relaxed bg-transparent placeholder:opacity-30"
        placeholder="Type important details here (e.g., allergies, preferences, family dynamics)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleSave} // Auto-save when you leave the box
      />
      <div className="pt-4 mt-auto border-t border-lumaire-brown/5 text-xs opacity-40">
        Auto-saves on click away
      </div>
    </div>
  );
}
