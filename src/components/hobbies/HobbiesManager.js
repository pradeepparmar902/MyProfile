"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

const CATEGORIES = ["Sports", "Art & Music", "Volunteering", "Leadership", "Travel", "Community Work", "Other"];

export function HobbiesManager({ initialItems, initialMedia = [] }) {
  const [items, setItems] = useState(initialItems);
  const [mediaByItem, setMediaByItem] = useState(initialMedia);
  const [message, setMessage] = useState("");

  async function addItem(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/hobbies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save.");
      return;
    }
    setItems([data.hobby, ...items]);
    setMediaByItem({ ...mediaByItem, [data.hobby.id]: [] });
    formElement.reset();
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/hobbies/${item.id}`, {
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
    await fetch(`/api/hobbies/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByItem };
    delete updated[id];
    setMediaByItem(updated);
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add Hobby & Personality</h2>
        <p className="text-sm text-slate-500 mt-1">Show recruiters who you are outside of work.</p>
        <form className="mt-5 grid gap-4" onSubmit={addItem}>
          <Field label="Category">
            <Select name="category" defaultValue="Sports">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title / Name"><Input name="title" placeholder="e.g. State-level Chess Player" required /></Field>
          <Field label="Description"><Textarea name="description" placeholder="What do you do?" /></Field>
          <Field label="Achievements (Optional)"><Textarea name="achievements" placeholder="Any notable achievements or leadership roles?" /></Field>
          
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Entry</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-[#4F46E5] mb-2">{item.category}</span>
                <h3 className="text-lg font-bold">{item.title}</h3>
                
                {item.description && (
                  <div className="mt-3">
                    <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p>
                  </div>
                )}
                {item.achievements && (
                  <div className="mt-3 border-l-2 border-[#06B6D4] pl-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Achievements</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-800">{item.achievements}</p>
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
                relatedType="HOBBY"
                relatedId={item.id}
                initialMedia={mediaByItem[item.id] || []}
                categories={["Photo", "Certificate", "Video Link", "Other"]}
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
