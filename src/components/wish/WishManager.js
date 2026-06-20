"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import RoadmapMindmap from "./RoadmapMindmap";
import { useRouter } from "next/navigation";

export function WishManager({ initialItems }) {
  const router = useRouter();
  const [wishes, setWishes] = useState(initialItems || []);
  const [activeWishId, setActiveWishId] = useState(initialItems && initialItems.length > 0 ? initialItems[0].id : 'new');
  const [draggedWishId, setDraggedWishId] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
    setIsConfirmingDelete(false);
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
    <div className="w-full max-w-full overflow-hidden print:overflow-visible flex flex-col gap-4 mb-8 relative">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-1 print:hidden">
        <div className="flex gap-2 items-center overflow-x-auto whitespace-nowrap pb-1">
          {wishes.map((wish) => (
            <button
              key={wish.id}
              draggable
              onDragStart={(e) => handleDragStart(e, wish.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, wish.id)}
              onDragEnd={() => setDraggedWishId(null)}
              onClick={() => setActiveWishId(wish.id)}
              className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                activeWishId === wish.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${draggedWishId === wish.id ? 'opacity-50 border-2 border-dashed border-slate-300' : 'opacity-100 border border-transparent'}`}
            >
              <span>{wish.title || 'Untitled Roadmap'}</span>
            </button>
          ))}
          
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100 flex-shrink-0"
            title="Create New Roadmap"
          >
            <Plus size={18} />
            <span>New Roadmap</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-2xl print:hidden">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Delete Roadmap?</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to permanently delete the <strong className="text-white">"{activeWish.title || 'Untitled Roadmap'}"</strong> roadmap? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteWish}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mindmap Canvas Wrapper */}
      <div className="w-full flex flex-col rounded-2xl overflow-hidden shadow-sm border border-slate-200 print:overflow-visible print:border-none print:shadow-none h-[calc(100vh-240px)] min-h-[500px] print:h-auto print:min-h-0">
        <RoadmapMindmap 
          key={activeWish.id} 
          wish={{...activeWish, isInline: true}} 
          onClose={() => {}} 
          onSave={handleWishSaved}
          onDelete={() => setIsConfirmingDelete(true)}
        />
      </div>
    </div>
  );
}
