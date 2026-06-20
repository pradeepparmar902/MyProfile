"use client";

import React from "react";
import RoadmapMindmap from "./RoadmapMindmap";

export function WishManager({ initialItems }) {
  // Use the very first wish as the singular Career Vision roadmap.
  // If no wishes exist, we'll initialize a dummy one that will trigger a POST on save.
  const masterRoadmap = initialItems?.length > 0 
    ? initialItems[0] 
    : { id: 'new', title: 'My Career Vision' };

  // Set isInline so the Mindmap renders as a block container instead of a fixed modal.
  const roadmapProps = { ...masterRoadmap, isInline: true };

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Interactive Career Roadmap</h3>
        <p className="text-slate-500 text-sm">
          Use the canvas below to visually map out your ultimate career vision. Break down your goals, add milestones, track progress, and organize your future steps in one place.
        </p>
      </div>

      {/* Render the Mindmap inline as the main content of this page */}
      <RoadmapMindmap 
        wish={roadmapProps} 
        onClose={() => {}} 
        onSave={() => {}} 
      />
    </div>
  );
}
