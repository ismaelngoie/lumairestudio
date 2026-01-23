'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkflowPicker({ clientId, templates }: { clientId: string, templates: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const applyWorkflow = async (templateId: string) => {
    if (!confirm("Auto-generate tasks from this workflow? This will add tasks based on the wedding date.")) return;
    
    setLoading(true);
    await fetch('/api/workflows/apply', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, template_id: templateId })
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="bg-lumaire-tan/10 p-6 rounded-sm border border-lumaire-brown/10">
      <h3 className="font-serif text-xl text-lumaire-brown mb-2">Automations</h3>
      <p className="text-sm opacity-60 mb-4">Apply a template to auto-generate tasks.</p>
      
      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="flex justify-between items-center bg-white p-3 border border-lumaire-tan/20">
            <div>
              <p className="font-bold text-lumaire-brown text-sm">{t.name}</p>
              <p className="text-xs opacity-50">{t.description}</p>
            </div>
            <button 
              onClick={() => applyWorkflow(t.id)}
              disabled={loading}
              className="text-xs uppercase tracking-widest bg-lumaire-brown text-white px-3 py-2 hover:bg-lumaire-wine transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Apply'}
            </button>
          </div>
        ))}
        {templates.length === 0 && <p className="text-xs opacity-50">No templates found.</p>}
      </div>
    </div>
  );
}
