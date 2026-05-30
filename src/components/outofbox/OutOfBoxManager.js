"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

export function OutOfBoxManager({ initialItems, initialMedia = [] }) {
  const [items, setItems] = useState(initialItems);
  const [mediaByItem, setMediaByItem] = useState(initialMedia);
  const [message, setMessage] = useState("");

  async function addItem(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/outofbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save.");
      return;
    }
    setItems([data.outOfBox, ...items]);
    setMediaByItem({ ...mediaByItem, [data.outOfBox.id]: [] });
    formElement.reset();
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/outofbox/${item.id}`, {
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
    await fetch(`/api/outofbox/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByItem };
    delete updated[id];
    setMediaByItem(updated);
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add Out-of-Box Thinking</h2>
        <p className="text-sm text-slate-500 mt-1">Showcase your creative experiments, failed attempts, and unique problem-solving ideas.</p>
        <form className="mt-5 grid gap-4" onSubmit={addItem}>
          <Field label="Title / Idea Name"><Input name="title" placeholder="e.g. Built a custom OS from scratch" required /></Field>
          <Field label="Context / Problem"><Textarea name="context" placeholder="Why did you start this?" /></Field>
          <Field label="The Innovation / What was different"><Textarea name="innovation" placeholder="How did you approach it creatively?" /></Field>
          <Field label="Result / Impact"><Textarea name="result" placeholder="What happened? Even if it failed!" /></Field>
          <Field label="Learnings"><Textarea name="learnings" placeholder="What did you learn?" /></Field>
          
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Entry</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                
                {item.context && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Context</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.context}</p>
                  </div>
                )}
                {item.innovation && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Innovation</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.innovation}</p>
                  </div>
                )}
                {item.result && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Result</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-emerald-800">{item.result}</p>
                  </div>
                )}
                {item.learnings && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Learnings</p>
                    <p className="mt-1 text-sm leading-6 text-indigo-900">{item.learnings}</p>
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

            <div className="mt-5">
              <MediaGallery
                title="Supporting Media"
                relatedType="OUTOFBOX"
                relatedId={item.id}
                initialMedia={mediaByItem[item.id] || []}
                categories={["Screenshot", "Demo Video", "Code Snippet", "Other"]}
              />
            </div>
          </Card>
        ))}
        {!items.length && (
          <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
            <p className="text-sm font-medium text-slate-500">No entries added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
