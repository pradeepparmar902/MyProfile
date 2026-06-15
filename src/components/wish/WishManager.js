"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function WishManager({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [message, setMessage] = useState("");

  async function addItem(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save.");
      return;
    }
    setItems([data.wish, ...items]);
    formElement.reset();
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/wishes/${item.id}`, {
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
    await fetch(`/api/wishes/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add Future Goals & Vision</h2>
        <p className="text-sm text-slate-500 mt-1">What do you want to achieve? Where do you want to reach in your career?</p>
        <form className="mt-5 grid gap-4" onSubmit={addItem}>
          <Field label="Goal / Vision Title"><Input name="title" placeholder="e.g. Become a Tech Lead" required /></Field>
          <Field label="Currently Achieved Steps"><Textarea name="achievedSteps" placeholder="What have you already done towards this?" /></Field>
          <Field label="Future Steps"><Textarea name="futureSteps" placeholder="What do you still need to do?" /></Field>
          <Field label="Your Thoughts"><Textarea name="thoughts" placeholder="Why is this important to you? What's your philosophy?" /></Field>
          
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Goal</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                
                {item.achievedSteps && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Achieved Steps</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-900">{item.achievedSteps}</p>
                  </div>
                )}
                {item.futureSteps && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Future Steps</p>
                    <p className="mt-1 text-sm leading-6 text-indigo-900">{item.futureSteps}</p>
                  </div>
                )}
                {item.thoughts && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">My Thoughts</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700 italic">"{item.thoughts}"</p>
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
          </Card>
        ))}
        {!items.length && (
          <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
            <p className="text-sm font-medium text-slate-500">No career visions added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
