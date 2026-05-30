"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

const projectMediaCategories = ["Screenshot", "Demo Photo", "PPT", "Certificate", "Document", "Other"];

export function ProjectsManager({ initialProjects, initialMedia = {} }) {
  const [items, setItems] = useState(initialProjects);
  const [mediaByProject, setMediaByProject] = useState(initialMedia);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function addProject(event) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save project.");
      return;
    }
    setItems([data.project, ...items]);
    setMediaByProject({ ...mediaByProject, [data.project.id]: [] });
    formElement.reset();
  }

  async function updateProject(event, id) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not update project.");
      return;
    }
    setItems(items.map((item) => (item.id === id ? data.project : item)));
    setEditingId(null);
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/projects/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(i => i.id === item.id ? (data.projects || Object.values(data)[0]) : i));
    }
  }

  async function deleteProject(id) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByProject };
    delete updated[id];
    setMediaByProject(updated);
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="text-xl font-bold">Add project</h2>
        <form className="mt-5 grid gap-4" onSubmit={addProject}>
          <Field label="Project title"><Input name="title" placeholder="Student Budget Tracker" required /></Field>
          <Field label="Description"><Textarea name="description" placeholder="What did you build?" /></Field>
          <Field label="Problem solved"><Textarea name="problemSolved" placeholder="Which user problem does it solve?" /></Field>
          <Field label="Tools used"><Input name="toolsUsed" placeholder="Excel, React, Canva" /></Field>
          <Field label="GitHub link"><Input name="githubLink" placeholder="https://github.com/..." /></Field>
          <Field label="Demo link"><Input name="demoLink" placeholder="https://example.com" /></Field>
          <Field label="Outcome"><Textarea name="outcome" placeholder="What changed because of this project?" /></Field>
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button><Plus size={16} /> Add Project</Button>
        </form>
      </Card>
      <div className="grid gap-4">
        {items.map((project) => (
          <Card key={project.id} className={`p-5 ${project.isHidden ? "opacity-50 grayscale" : ""}`}>
            {editingId === project.id ? (
              <form className="grid gap-4" onSubmit={(event) => updateProject(event, project.id)}>
                <Field label="Project title"><Input name="title" defaultValue={project.title} required /></Field>
                <Field label="Description"><Textarea name="description" defaultValue={project.description || ""} /></Field>
                <Field label="Problem solved"><Textarea name="problemSolved" defaultValue={project.problemSolved || ""} /></Field>
                <Field label="Tools used"><Input name="toolsUsed" defaultValue={project.toolsUsed || ""} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="GitHub link"><Input name="githubLink" defaultValue={project.githubLink || ""} /></Field>
                  <Field label="Demo link"><Input name="demoLink" defaultValue={project.demoLink || ""} /></Field>
                </div>
                <Field label="Outcome"><Textarea name="outcome" defaultValue={project.outcome || ""} /></Field>
                <div className="flex gap-3">
                  <Button type="submit">Save Project</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditingId(null)}><X size={16} /> Cancel</Button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{project.title}</h3>
                    {project.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p> : null}
                    {project.problemSolved ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Problem solved:</span> {project.problemSolved}</p>
                    ) : null}
                    {project.outcome ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Outcome:</span> {project.outcome}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(project.toolsUsed || "").split(",").map((tool) => tool.trim()).filter(Boolean).map((tool) => <Badge key={tool}>{tool}</Badge>)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {project.githubLink ? (
                        <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5]" href={project.githubLink} target="_blank" rel="noreferrer">
                          GitHub <ExternalLink size={14} />
                        </a>
                      ) : null}
                      {project.demoLink ? (
                        <a className="inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5]" href={project.demoLink} target="_blank" rel="noreferrer">
                          Demo <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => setEditingId(project.id)} title="Edit project">
                      <Pencil size={16} />
                    </button>
                    <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => toggleVisibility(project)} title={project.isHidden ? "Show on profile" : "Hide from profile"}>{project.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteProject(project.id)} title="Delete project">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-5">
                  <MediaGallery
                    title="Project Gallery"
                    relatedType="PROJECT"
                    relatedId={project.id}
                    initialMedia={mediaByProject[project.id] || []}
                    categories={projectMediaCategories}
                  />
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
