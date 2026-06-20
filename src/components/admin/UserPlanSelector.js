"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserPlanSelector({ userId, currentPlanId, plans }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e) => {
    const newPlanId = e.target.value;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: newPlanId })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update user plan");
      }
    } catch (err) {
      alert("Error updating plan");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select 
      value={currentPlanId || "default"} 
      onChange={handleChange}
      disabled={isUpdating}
      className="text-xs p-1 border rounded bg-white text-slate-700"
    >
      <option value="default">Default Plan</option>
      {plans.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
