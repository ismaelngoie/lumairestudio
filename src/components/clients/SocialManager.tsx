'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SocialManager({ clientId, data }: { clientId: string, data: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'planner'>('profiles');
  
  const [newItem, setNewItem] = useState({ type: 'handle', value: '', platform: 'Instagram' });
  const [isAdding, setIsAdding] = useState(false);

  const handles = data.filter(d => d.type === 'handle');
  const hashtags = data.filter(d => d.type === 'hashtag');
  const ideas = data.filter(d => d.type === 'idea');

  const handleAdd = async () => {
    if (!newItem.value) return;
    await fetch('/api/social', {
      method: 'POST',
      body: JSON.stringify({ ...newItem, client_id: clientId })
    });
    setNewItem({ type: activeTab === 'profiles' ? 'handle' : 'idea', value: '', platform: 'Instagram' });
    setIsAdding(false);
    router.refresh();
  };

  const deleteItem = async (id: string) => {
    if(!confirm("Delete this item?")) return;
    await fetch(`/api/social?id=${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'posted' ? 'todo' : 'posted';
    await fetch('/api/social', {
      method: 'PATCH',
      body: JSON.stringify({ id: item.id, status: newStatus })
    });
    router.refresh();
  };

  return (
    <div className="bg-white border border-lumaire-tan/20 rounded-sm overflow-hidden">
      {/* TABS HEADER */}
      <div className="flex border-b border-lumaire-tan/20 bg-lumaire-tan/5">
        <button 
          onClick={() => { setActiveTab('profiles'); setIsAdding(false); }}
          className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold ${activeTab === 'profiles' ? 'bg-white text-lumaire-brown border-b-2 border-lumaire-brown' : 'text-lumaire-brown/50 hover:text-lumaire-brown'}`}
        >
          Profiles & Tags
        </button>
        <button 
          onClick={() => { setActiveTab('planner'); setIsAdding(false); }}
          className={`flex-1 py-3 text-xs uppercase tracking-widest font-bold ${activeTab === 'planner' ? 'bg-white text-lumaire-brown border-b-2 border-lumaire-brown' : 'text-lumaire-brown/50 hover:text-lumaire-brown'}`}
        >
          Content Planner
        </button>
      </div>

      <div className="p-6">
        {/* ADD BUTTON */}
        <div className="flex justify-end mb-4">
           <button onClick={() => setIsAdding(!isAdding)} className="text-[10px] uppercase font-bold text-lumaire-brown border border-lumaire-brown/20 px-3 py-1 hover:bg-lumaire-brown hover:text-white transition-colors">
             {isAdding ? 'Cancel' : '+ Add Item'}
           </button>
        </div>

        {/* ADD FORM */}
        {isAdding && (
          <div className="bg-lumaire-tan/10 p-4 mb-4 rounded-sm space-y-3 animate-in fade-in slide-in-from-top-2">
             <div className="flex gap-2">
               {activeTab === 'profiles' ? (
                 <select className="p-2 text-sm border border-lumaire-tan/20" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                   <option value="handle">Handle (@)</option>
                   <option value="hashtag">Hashtag (#)</option>
                 </select>
               ) : (
                 <span className="p-2 text-sm bg-white border border-lumaire-tan/20 text-lumaire-brown/50 block w-24 text-center">Idea</span>
               )}
               
               <select className="p-2 text-sm border border-lumaire-tan/20" value={newItem.platform} onChange={e => setNewItem({...newItem, platform: e.target.value})}>
                 <option value="Instagram">Instagram</option>
                 <option value="TikTok">TikTok</option>
                 <option value="Pinterest">Pinterest</option>
                 <option value="All">All</option>
               </select>
             </div>
             <input 
               className="w-full p-2 text-sm border border-lumaire-tan/20" 
               placeholder={activeTab === 'profiles' ? "@username or #wedding" : "Reel Idea: Venue Tour..."}
               value={newItem.value} 
               onChange={e => setNewItem({...newItem, value: e.target.value})} 
             />
             <button onClick={handleAdd} className="w-full bg-lumaire-brown text-white py-2 text-xs uppercase tracking-widest hover:bg-lumaire-wine">Save</button>
          </div>
        )}

        {/* --- VIEW: PROFILES --- */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
             {/* HASHTAGS (The Hero) */}
             {hashtags.length > 0 && (
               <div className="text-center p-4 bg-lumaire-tan/5 border border-dashed border-lumaire-brown/10">
                 <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Official Hashtag</p>
                 {hashtags.map(h => (
                   <div key={h.id} className="group relative inline-block">
                     <p className="font-serif text-2xl text-lumaire-brown">{h.value}</p>
                     <button onClick={() => deleteItem(h.id)} className="absolute -right-4 top-1 text-red-300 opacity-0 group-hover:opacity-100 text-xs">×</button>
                   </div>
                 ))}
               </div>
             )}

             {/* HANDLES */}
             <div>
               <h4 className="text-xs uppercase tracking-widest opacity-50 mb-3">Linked Accounts</h4>
               <div className="space-y-3">
                 {handles.map(h => (
                   <div key={h.id} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{h.platform === 'Instagram' ? '📸' : h.platform === 'TikTok' ? '🎵' : '📌'}</span>
                        <a 
                          href={`https://${h.platform}.com/${h.value.replace('@','')}`} 
                          target="_blank" 
                          className="text-sm font-bold text-lumaire-brown hover:underline"
                        >
                          {h.value}
                        </a>
                      </div>
                      <button onClick={() => deleteItem(h.id)} className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 text-xs uppercase font-bold">Remove</button>
                   </div>
                 ))}
                 {handles.length === 0 && <p className="text-sm opacity-50 italic">No accounts linked.</p>}
               </div>
             </div>
          </div>
        )}

        {/* --- VIEW: PLANNER --- */}
        {activeTab === 'planner' && (
          <div className="space-y-3">
            {ideas.map(idea => (
              <div key={idea.id} className={`p-3 border rounded-sm flex gap-3 items-start group transition-all ${idea.status === 'posted' ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-lumaire-tan/20'}`}>
                <div 
                  onClick={() => toggleStatus(idea)}
                  className={`w-5 h-5 mt-1 border rounded-full flex items-center justify-center cursor-pointer transition-colors ${idea.status === 'posted' ? 'bg-green-500 border-green-500 text-white' : 'border-lumaire-brown hover:bg-lumaire-tan/20'}`}
                >
                  {idea.status === 'posted' && '✓'}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${idea.status === 'posted' ? 'line-through' : 'font-medium text-lumaire-brown'}`}>{idea.value}</p>
                  <p className="text-[10px] uppercase opacity-50 mt-1">{idea.platform}</p>
                </div>
                <button onClick={() => deleteItem(idea.id)} className="text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500 text-lg leading-none">×</button>
              </div>
            ))}
            {ideas.length === 0 && <p className="text-sm opacity-50 italic text-center py-4">No content ideas yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
