"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RoadmapMindmap from "./RoadmapMindmap";
import { useRouter } from "next/navigation";

export function WishManager({ initialItems }) {
  const router = useRouter();
  const [wishes, setWishes] = useState(initialItems || []);
  const [activeWishId, setActiveWishId] = useState(
    initialItems?.length > 0 ? initialItems[0].id : 'new'
  );

  // Update wishes when initialItems changes (e.g. after router.refresh)
  useEffect(() => {
    if (initialItems) {
      setWishes(initialItems);
      // If active wish was a temporary one, switch to the newly saved real one.
      // This happens because the DB returns a new ID. We can just pick the first item if active is missing.
      if (!initialItems.find(w => w.id === activeWishId)) {
        setActiveWishId(initialItems.length > 0 ? initialItems[0].id : 'new');
      }
    }
  }, [initialItems]);

  const activeWish = wishes.find(w => w.id === activeWishId) || { id: 'new', title: 'Untitled Roadmap' };

  const handleAddNew = () => {
    const tempId = `new-${Date.now()}`;
    const newWish = { id: tempId, title: 'Untitled Roadmap' };
    setWishes([...wishes, newWish]);
    setActiveWishId(tempId);
  };

  const handleWishSaved = (mindmapData, isNew, newTitle) => {
    if (isNew) {
      router.refresh();
    } else if (newTitle) {
      setWishes(prev => prev.map(w => w.id === activeWishId ? { ...w, title: newTitle } : w));
    }
  };

  const handleDeleteWish = async () => {
    if (!confirm("Are you sure you want to delete this roadmap? This cannot be undone.")) return;
    
    if (!activeWishId.startsWith('new')) {
      await fetch(`/api/wishes/${activeWishId}`, { method: 'DELETE' });
    }
    
    const remainingWishes = wishes.filter(w => w.id !== activeWishId);
    setWishes(remainingWishes);
    
    if (remainingWishes.length > 0) {
      setActiveWishId(remainingWishes[0].id);
    } else {
      const tempId = `new-${Date.now()}`;
      setWishes([{ id: tempId, title: 'Untitled Roadmap' }]);
      setActiveWishId(tempId);
    }
    
    router.refresh();
  };

  return (
    <div className="w-full flex flex-col h-full gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-2">
        <div className="flex gap-2 items-center overflow-x-auto">
          {wishes.map((wish) => (
            <button
              key={wish.id}
              onClick={() => setActiveWishId(wish.id)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                activeWishId === wish.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {wish.title || 'Untitled Roadmap'}
            </button>
          ))}
          
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100"
            title="Create New Roadmap"
          >
            <Plus size={18} />
            <span>New Roadmap</span>
          </button>
        </div>
      </div>

      <div className="w-full h-[750px] flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <RoadmapMindmap 
          key={activeWish.id} 
          wish={{...activeWish, isInline: true}} 
          onClose={() => {}} 
          onSave={handleWishSaved}
          onDelete={handleDeleteWish}
        />
      </div>
    </div>
  );
}
