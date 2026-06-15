"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

export function SportsManager({ initialItems, initialMedia = {} }) {
  const [items, setItems] = useState(initialItems || []);
  const [message, setMessage] = useState("");
  const [mediaByItem, setMediaByItem] = useState(initialMedia);

  async function addItem(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save.");
      return;
    }
    setItems([data.sport, ...items]);
    formElement.reset();
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/sports/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(i => i.id === item.id ? (Object.values(data)[0] || item) : i));
    }
  }

  async function deleteItem(id) {
    await fetch(`/api/sports/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add Sports Activity</h2>
        <p className="text-sm text-slate-500 mt-1">Log your sports involvement, teams, and related achievements.</p>
        <form className="mt-5 grid gap-4" onSubmit={addItem}>
          <Field label="Sport / Team Name"><Input name="title" placeholder="e.g. Varsity Basketball" required /></Field>
          <Field label="Description"><Textarea name="description" placeholder="What role did you play? How long were you involved?" /></Field>
          <Field label="Achievements (Optional)"><Textarea name="achievements" placeholder="e.g. State Champions 2023, Team Captain" /></Field>
          
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Sport</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                
                {item.description && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                )}
                {item.achievements && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Achievements</p>
                    <p className="mt-1 text-sm font-medium text-emerald-900">{item.achievements}</p>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => toggleVisibility(item)}
                  title={item.isHidden ? "Show on profile" : "Hide from profile"}
                >
                  {item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                  onClick={() => deleteItem(item.id)}
                  title="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-4">
              <MediaGallery
                title="Upload proof"
                relatedType="SPORT"
                relatedId={item.id}
                initialMedia={mediaByItem[item.id] || []}
                categories={["Certificate", "Photo", "Award", "Other"]}
                compact={true}
              />
            </div>
          </Card>
        ))}
        {!items.length && (
          <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
            <p className="text-sm font-medium text-slate-500">No sports activities added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
