"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Target, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import RoadmapMindmap from "./RoadmapMindmap";

export function WishManager({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [message, setMessage] = useState("");
  const [activeRoadmap, setActiveRoadmap] = useState(null);

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
          <Card key={item.id} className={`p-6 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-end gap-2 mb-4 absolute top-4 right-4 z-20">
              <button
                className="grid size-8 place-items-center rounded-lg bg-white/50 hover:bg-white text-slate-700 shadow-sm transition-colors"
                onClick={() => toggleVisibility(item)}
                title={item.isHidden ? "Show on profile" : "Hide from profile"}
              >
                {item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="grid size-8 place-items-center rounded-lg bg-white/50 hover:bg-red-50 text-red-600 shadow-sm transition-colors"
                onClick={() => deleteItem(item.id)}
                title="Delete entry"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-stretch mt-4">
              {/* Left Side: GOAL (Orange) */}
              <div className="flex-1 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 transform transition-transform group-hover:scale-110">
                  <Target size={100} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-orange-100 text-xs font-bold uppercase tracking-widest">
                    <Target size={14} /> Goal / Wish List
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  {item.futureSteps && (
                    <p className="text-orange-50 leading-relaxed text-sm">
                      <strong className="text-white">Plan:</strong> {item.futureSteps}
                    </p>
                  )}
                  {item.thoughts && (
                    <div className="mt-4 bg-black/10 rounded-lg p-3 border-l-4 border-orange-300">
                      <p className="text-orange-50 italic text-sm">"{item.thoughts}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              <div className="hidden md:flex flex-col justify-center items-center px-1">
                <ArrowRight className="text-slate-300" size={24} />
              </div>

              {/* Right Side: ACHIEVED (Purple) or Roadmap Summary */}
              <div className="flex-1">
                {item.achievedSteps ? (
                  <div className="h-full bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 transform transition-transform group-hover:scale-110">
                      <CheckCircle2 size={100} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-purple-200 text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Achieved / Where we are
                      </div>
                      <p className="text-purple-50 leading-relaxed font-medium text-sm">
                        {item.achievedSteps}
                      </p>
                    </div>
                  </div>
                ) : item.mindmapData ? (
                  <div className="h-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 text-slate-400">
                      <Target size={100} />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">Interactive Roadmap Active</h4>
                    <p className="text-sm text-slate-500 mb-3">You have {JSON.parse(item.mindmapData).nodes?.length - 1 || 0} milestones defined.</p>
                    <button
                      onClick={() => setActiveRoadmap(item)}
                      className="px-4 py-2 w-max bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      View Roadmap
                    </button>
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-sm font-medium">Journey just beginning</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!items.length && (
          <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
            <p className="text-sm font-medium text-slate-500">No career visions added yet.</p>
          </div>
        )}
        
        {items.length > 0 && (
          <div className="mt-4 text-center p-6 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-2">Build Your Visual Roadmap</h4>
            <p className="text-sm text-slate-600 mb-4 max-w-lg mx-auto">
              Click the button below to open the interactive mindmap canvas. You can visually break down your goals, add milestones, and track your progress in real-time.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveRoadmap(item)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Sparkles size={16} /> Roadmap for: {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Mindmap Modal */}
      {activeRoadmap && (
        <RoadmapMindmap
          wish={activeRoadmap}
          onClose={() => setActiveRoadmap(null)}
          onSave={(mindmapData) => {
            setItems(items.map(i => i.id === activeRoadmap.id ? { ...i, mindmapData: JSON.stringify(mindmapData) } : i));
          }}
        />
      )}
    </div>
  );
}
