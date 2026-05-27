"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

export function EducationManager({ initialEducation, initialMedia = [] }) {
  const [items, setItems] = useState(initialEducation);
  const [mediaByEducation, setMediaByEducation] = useState(initialMedia);
  const [message, setMessage] = useState("");

  async function addEducation(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save education.");
      return;
    }
    setItems([data.education, ...items]);
    setMediaByEducation({ ...mediaByEducation, [data.education.id]: [] });
    formElement.reset();
  }

  async function deleteEducation(id) {
    await fetch(`/api/education/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByEducation };
    delete updated[id];
    setMediaByEducation(updated);
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add education</h2>
        <form className="mt-5 grid gap-4" onSubmit={addEducation}>
          <Field label="Institution"><Input name="institutionName" placeholder="College or school name" required /></Field>
          <Field label="Degree/course"><Input name="degree" placeholder="B.Com, B.Tech, MBA" required /></Field>
          <Field label="Field of study"><Input name="fieldOfStudy" placeholder="Commerce, Marketing" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start year"><Input name="startYear" placeholder="2023" /></Field>
            <Field label="End year"><Input name="endYear" placeholder="2026" /></Field>
          </div>
          <Field label="Grade/marks"><Input name="grade" placeholder="8.2 CGPA" /></Field>
          <Field label="Highlights"><Textarea name="description" placeholder="Academic focus, activities, strengths" /></Field>
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Education</Button>
        </form>
      </Card>
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4F46E5]">{item.startYear || ""} - {item.endYear || ""}</p>
                <h3 className="mt-1 text-lg font-bold">{item.institutionName}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.degree} {item.fieldOfStudy ? `· ${item.fieldOfStudy}` : ""}</p>
                <p className="mt-2 text-sm text-slate-600">{item.grade}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteEducation(item.id)} title="Delete education">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mt-5">
              <MediaGallery
                title="Education Documents"
                relatedType="EDUCATION"
                relatedId={item.id}
                initialMedia={mediaByEducation[item.id] || []}
                categories={["Marksheet", "Certificate", "Honour Photo", "Degree", "Other"]}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
