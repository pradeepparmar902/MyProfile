"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import RoadmapMindmap from "./RoadmapMindmap";
import { useRouter } from "next/navigation";

export function RoadmapManager({ initialItems }) {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState(initialItems || []);
  const [activeRoadmapId, setActiveRoadmapId] = useState(initialItems && initialItems.length > 0 ? initialItems[0].id : 'new');
  const [draggedRoadmapId, setDraggedRoadmapId] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (initialItems) {
      let orderedItems = [...initialItems];
      const savedOrder = localStorage.getItem('roadmapTabsOrder');
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
      setRoadmaps(orderedItems);
      // If active roadmap was a temporary one, switch to the newly saved real one.
      if (!orderedItems.find(w => w.id === activeRoadmapId)) {
        setActiveRoadmapId(orderedItems.length > 0 ? orderedItems[0].id : 'new');
      }
    }
  }, [initialItems]);

  const activeRoadmap = roadmaps.find(w => w.id === activeRoadmapId) || { id: 'new', title: 'Untitled Roadmap' };

  const handleDragStart = (e, id) => {
    setDraggedRoadmapId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id); // Firefox compatibility
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedRoadmapId || draggedRoadmapId === targetId) return;

    const draggedIdx = roadmaps.findIndex(w => w.id === draggedRoadmapId);
    const targetIdx = roadmaps.findIndex(w => w.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newRoadmaps = [...roadmaps];
    const [draggedItem] = newRoadmaps.splice(draggedIdx, 1);
    newRoadmaps.splice(targetIdx, 0, draggedItem);

    setRoadmaps(newRoadmaps);
    setDraggedRoadmapId(null);
    localStorage.setItem('roadmapTabsOrder', JSON.stringify(newRoadmaps.map(w => w.id)));
  };

  const handleAddNew = () => {
    const tempId = `new-${Date.now()}`;
    const newRoadmap = { id: tempId, title: 'Untitled Roadmap' };
    setRoadmaps([...roadmaps, newRoadmap]);
    setActiveRoadmapId(tempId);
  };

  const handleRoadmapSaved = (mindmapData, isNew, newTitle) => {
    if (isNew) {
      router.refresh();
    } else if (newTitle) {
      setRoadmaps(prev => prev.map(w => w.id === activeRoadmapId ? { ...w, title: newTitle } : w));
    }
  };

  const handleDeleteRoadmap = async () => {
    setIsConfirmingDelete(false);
    if (!activeRoadmapId.startsWith('new')) {
      await fetch(`/api/roadmaps/${activeRoadmapId}`, { method: 'DELETE' });
    }
    
    const remainingRoadmaps = roadmaps.filter(w => w.id !== activeRoadmapId);
    setRoadmaps(remainingRoadmaps);
    
    if (remainingRoadmaps.length > 0) {
      setActiveRoadmapId(remainingRoadmaps[0].id);
    } else {
      const tempId = `new-${Date.now()}`;
      setRoadmaps([{ id: tempId, title: 'Untitled Roadmap' }]);
      setActiveRoadmapId(tempId);
    }
    
    router.refresh();
  };

  return (
    <div className="w-full max-w-full overflow-hidden print:overflow-visible flex flex-col gap-4 mb-8 relative">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-1 print:hidden">
        <div className="flex gap-2 items-center overflow-x-auto whitespace-nowrap pb-1">
          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              draggable
              onDragStart={(e) => handleDragStart(e, roadmap.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, roadmap.id)}
              onDragEnd={() => setDraggedRoadmapId(null)}
              onClick={() => setActiveRoadmapId(roadmap.id)}
              className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                activeRoadmapId === roadmap.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              } ${draggedRoadmapId === roadmap.id ? 'opacity-50 border-2 border-dashed border-slate-300' : 'opacity-100 border border-transparent'}`}
            >
              <span>{roadmap.title || 'Untitled Roadmap'}</span>
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
              Are you sure you want to permanently delete the <strong className="text-white">"{activeRoadmap.title || 'Untitled Roadmap'}"</strong> roadmap? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteRoadmap}
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
          key={activeRoadmap.id} 
          roadmap={{...activeRoadmap, isInline: true}} 
          onClose={() => {}} 
          onSave={handleRoadmapSaved}
          onDelete={() => setIsConfirmingDelete(true)}
        />
      </div>
    </div>
  );
}
