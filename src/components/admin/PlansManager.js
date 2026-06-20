"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2, Plus, Save, X, Star } from "lucide-react";

export function PlansManager({ initialPlans }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans || []);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setFormData(plan);
  };

  const handleAddNew = () => {
    const newId = "new_" + Date.now();
    const newPlan = {
      id: newId,
      name: "",
      price: 0,
      resumeLimit: 1,
      roadmapLimit: 1,
      inviteLimit: 0,
      isDefault: false
    };
    setPlans([newPlan, ...plans]);
    setEditingId(newId);
    setFormData(newPlan);
  };

  const handleCancel = (id) => {
    if (id.startsWith("new_")) {
      setPlans(plans.filter(p => p.id !== id));
    }
    setEditingId(null);
  };

  const handleSave = async () => {
    const isNew = formData.id.startsWith("new_");
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${formData.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.refresh();
        const savedPlan = await res.json();
        setPlans(plans.map(p => p.id === formData.id ? savedPlan.plan : p));
        setEditingId(null);
      } else {
        alert("Failed to save plan.");
      }
    } catch (e) {
      alert("Error saving plan.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      setPlans(plans.filter(p => p.id !== id));
      router.refresh();
    } catch (e) {
      alert("Error deleting plan.");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button onClick={handleAddNew} disabled={editingId !== null}>
          <Plus size={16} className="mr-2" /> Add New Plan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isEditing = editingId === plan.id;
          
          if (isEditing) {
            return (
              <Card key={plan.id} className="p-6 border-indigo-500 ring-2 ring-indigo-200">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Plan Name</label>
                    <input
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Pro"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Price (₹ or $)</label>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Resumes</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={formData.resumeLimit}
                        onChange={e => setFormData({...formData, resumeLimit: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Roadmaps</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={formData.roadmapLimit}
                        onChange={e => setFormData({...formData, roadmapLimit: Number(e.target.value)})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Recruiter Links</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded-md"
                        value={formData.inviteLimit}
                        onChange={e => setFormData({...formData, inviteLimit: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium mt-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isDefault}
                      onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    Make Default Plan
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSave} className="w-full"><Save size={16} className="mr-2"/> Save</Button>
                    <Button onClick={() => handleCancel(plan.id)} variant="outline" className="w-full"><X size={16} className="mr-2"/> Cancel</Button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card key={plan.id} className="p-6 flex flex-col relative overflow-hidden group">
              {plan.isDefault && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Star size={12} /> Default
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-3xl font-black text-indigo-600 my-4">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
              
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-600">
                <li className="flex justify-between border-b pb-2"><span>Resumes</span> <strong>{plan.resumeLimit >= 9999 ? "Unlimited" : plan.resumeLimit}</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Roadmaps</span> <strong>{plan.roadmapLimit >= 9999 ? "Unlimited" : plan.roadmapLimit}</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Recruiter Links</span> <strong>{plan.inviteLimit >= 9999 ? "Unlimited" : plan.inviteLimit}</strong></li>
              </ul>

              <div className="flex gap-2 mt-auto">
                <Button onClick={() => handleEdit(plan)} variant="secondary" className="flex-1">
                  <Edit2 size={16} className="mr-2" /> Edit
                </Button>
                <Button onClick={() => handleDelete(plan.id)} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
