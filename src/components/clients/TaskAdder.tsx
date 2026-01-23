'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskAdder({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addTask = async () => {
    if (!title) return;
    setIsAdding(true);
    // Default due date to "tomorrow" for speed
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, title, due_date: tomorrow.toISOString().split('T')[0] })
    });
    
    setTitle('');
    setIsAdding(false);
    router.refresh();
  };

  return (
    <div className="mt-4 flex gap-2">
      <input 
        className="flex-1 p-2 text-sm border-b border-lumaire-brown/20 bg-transparent outline-none focus:border-lumaire-brown"
        placeholder="+ Type new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addTask()}
      />
      <button 
        onClick={addTask}
        disabled={isAdding}
        className="text-xs uppercase font-bold text-lumaire-brown hover:text-lumaire-wine"
      >
        Add
      </button>
    </div>
  );
}
