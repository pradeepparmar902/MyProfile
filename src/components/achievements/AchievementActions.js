"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";

export function AchievementActions({ initialAchievement }) {
  const [achievement, setAchievement] = useState(initialAchievement);
  const [isDeleted, setIsDeleted] = useState(false);

  async function toggleVisibility() {
    const res = await fetch(`/api/achievements/${achievement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...achievement, isHidden: !achievement.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setAchievement(data.achievements || Object.values(data)[0] || { ...achievement, isHidden: !achievement.isHidden });
      // Reload page to reflect changes properly
      window.location.reload();
    }
  }

  async function deleteAchievement() {
    const res = await fetch(`/api/achievements/${achievement.id}`, { method: "DELETE" });
    if (res.ok) {
      setIsDeleted(true);
      window.location.reload();
    }
  }

  if (isDeleted) return null;

  return (
    <>
      <button 
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        onClick={toggleVisibility}
        title={achievement.isHidden ? "Show on profile" : "Hide from profile"}
      >
        {achievement.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
        {achievement.isHidden ? "Hidden" : "Visible"}
      </button>
      <button 
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 text-red-600 px-4 text-sm font-semibold hover:bg-red-50"
        onClick={deleteAchievement}
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </>
  );
}
