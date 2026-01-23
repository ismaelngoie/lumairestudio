'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentManager({ clientId, documents }: { clientId: string, documents: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Contracts', type: 'Link', url: '' });

  const categories = ['All', 'Contracts', 'Design', 'Questionnaires', 'Admin'];
  
  const filteredDocs = activeTab === 'All' 
    ? documents 
    : documents.filter(d => d.category === activeTab);

  const handleAdd = async () => {
    if (!newDoc.name || !newDoc.url) return;
    await fetch('/api/documents', {
      method: 'POST',
      body: JSON.stringify({ ...newDoc, client_id: clientId })
    });
    setNewDoc({ name: '', category: 'Contracts', type: 'Link', url: '' });
    setIsAdding(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this document?")) return;
    await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-6" id="documents">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-2xl text-lumaire-brown">Documents & Files</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="text-xs uppercase tracking-widest bg-lumaire-brown text-white px-4 py-2 hover:bg-lumaire-wine transition-colors"
        >
          {isAdding ? 'Cancel' : '+ Add File'}
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-lumaire-brown/10 pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`text-xs uppercase tracking-widest pb-2 transition-colors ${activeTab === cat ? 'text-lumaire-brown border-b-2 border-lumaire-brown' : 'text-lumaire-brown/40 hover:text-lumaire-brown'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ADD FORM */}
      {isAdding && (
        <div className="bg-lumaire-tan/10 p-4 rounded-sm space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="grid grid-cols-2 gap-4">
             <input className="p-2 border border-lumaire-tan/20" placeholder="File Name (e.g., Catering Contract)" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} />
             <select className="p-2 border border-lumaire-tan/20" value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})}>
               <option value="Contracts">Contracts</option>
               <option value="Design">Design / Mood Board</option>
               <option value="Questionnaires">Questionnaires</option>
               <option value="Admin">Admin</option>
             </select>
           </div>
           <input className="w-full p-2 border border-lumaire-tan/20" placeholder="URL (Google Drive Link, Dropbox, or Image URL)" value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} />
           <div className="text-right">
             <button onClick={handleAdd} className="bg-lumaire-brown text-white px-6 py-2 text-xs uppercase hover:bg-lumaire-wine">Save Item</button>
           </div>
        </div>
      )}

      {/* FILE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="group relative flex items-start gap-4 p-4 bg-white border border-lumaire-tan/20 hover:border-lumaire-brown/30 transition-all shadow-sm">
             {/* ICON BASED ON TYPE */}
             <div className="w-10 h-10 bg-lumaire-tan/20 flex items-center justify-center text-lg text-lumaire-brown rounded-sm shrink-0">
               {doc.category === 'Design' ? '🎨' : doc.category === 'Contracts' ? '📄' : '📋'}
             </div>
             
             <div className="flex-1 min-w-0">
               <h4 className="font-serif text-lg text-lumaire-brown truncate">{doc.name}</h4>
               <p className="text-xs uppercase opacity-50 mb-2">{doc.category} • {doc.date}</p>
               
               {/* PREVIEW FOR IMAGES */}
               {doc.category === 'Design' && doc.url.startsWith('http') && (
                 <div className="h-20 w-full bg-gray-100 mb-2 overflow-hidden rounded-sm">
                   <img src={doc.url} alt="preview" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                 </div>
               )}

               <a href={doc.url} target="_blank" className="text-xs underline text-lumaire-brown hover:text-lumaire-wine">Open File ↗</a>
             </div>

             <button 
               onClick={() => handleDelete(doc.id)}
               className="absolute top-2 right-2 text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 text-lg leading-none p-1"
             >
               ×
             </button>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-2 text-center py-8 opacity-50 italic text-sm border border-dashed border-lumaire-brown/10">
            No documents in this folder.
          </div>
        )}
      </div>
    </div>
  );
}
