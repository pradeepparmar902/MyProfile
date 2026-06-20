"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RoadmapMindmap from "./RoadmapMindmap";
import { useRouter } from "next/navigation";

export function WishManager({ initialItems }) {
  const router = useRouter();
  const [wishes, setWishes] = useState(initialItems || []);
  const [activeWishId, setActiveWishId] = useState(initialItems && initialItems.length > 0 ? initialItems[0].id : 'new');
  const [draggedWishId, setDraggedWishId] = useState(null);

  useEffect(() => {
    if (initialItems) {
      let orderedItems = [...initialItems];
      const savedOrder = localStorage.getItem('wishTabsOrder');
      if (savedOrder) {
        try {
          const orderMap = JSON.parse(savedOrder);
          orderedItems.sort((a, b) => {
            const idxA = orderMap.indexOf(a.id);
            const idxB = orderMap.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return 0;
          });
        } catch (e) {}
      }
      setWishes(orderedItems);
      // If active wish was a temporary one, switch to the newly saved real one.
      if (!orderedItems.find(w => w.id === activeWishId)) {
        setActiveWishId(orderedItems.length > 0 ? orderedItems[0].id : 'new');
      }
    }
  }, [initialItems]);

  const activeWish = wishes.find(w => w.id === activeWishId) || { id: 'new', title: 'Untitled Roadmap' };

  const handleDragStart = (e, id) => {
    setDraggedWishId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Firefox compatibility
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedWishId || draggedWishId === targetId) return;

    const draggedIdx = wishes.findIndex(w => w.id === draggedWishId);
    const targetIdx = wishes.findIndex(w => w.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newWishes = [...wishes];
    const [draggedItem] = newWishes.splice(draggedIdx, 1);
    newWishes.splice(targetIdx, 0, draggedItem);

    setWishes(newWishes);
    setDraggedWishId(null);
    localStorage.setItem('wishTabsOrder', JSON.stringify(newWishes.map(w => w.id)));
  };

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
        <div className="flex gap-2 items-center flex-wrap">
          {wishes.map((wish) => (
            <button
              key={wish.id}
              draggable
              onDragStart={(e) => handleDragStart(e, wish.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, wish.id)}
              onDragEnd={() => setDraggedWishId(null)}
              onClick={() => setActiveWishId(wish.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                activeWishId === wish.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${draggedWishId === wish.id ? 'opacity-50 border-2 border-dashed border-slate-300' : 'opacity-100 border border-transparent'}`}
            >
              {wish.title || 'Untitled Roadmap'}
            </button>
          ))}
          
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100 shrink-0"
            title="Create New Roadmap"
          >
            <Plus size={18} />
            <span>New Roadmap</span>
          </button>
        </div>
      </div>

      {/* Mindmap Canvas Wrapper */}
      <div className="w-full h-[650px] flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200">
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
