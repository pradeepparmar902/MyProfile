"use client";

import { useState } from "react";
import { ExternalLink, FileText, ImageIcon, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";

const skillMediaCategories = ["Certificate", "Screenshot", "Project Proof", "Course Proof", "Document", "Other"];

function SkillProofList({ media = [] }) {
  if (!media.length) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        No proof files added yet.
      </p>
    );
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {media.map((item) => (
        <ProofPreview key={item.id} item={item} />
      ))}
    </div>
  );
}

function ProofPreview({ item }) {
  const isImage = item.fileType === "IMAGE" || /\.(png|jpe?g|webp|gif)$/i.test(item.fileName || "");

  return (
    <a
      href={item.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:border-[#4F46E5] hover:bg-white"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.fileUrl} alt={item.fileName} className="h-32 w-full bg-white object-cover" />
      ) : (
        <div className="grid h-32 place-items-center bg-white text-[#4F46E5]">
          <FileText size={34} />
        </div>
      )}
      <div className="p-3">
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#4F46E5]">
          {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
          {item.category}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{item.fileName}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          Open file <ExternalLink size={13} />
        </p>
      </div>
    </a>
  );
}

export function SkillsManager({ initialSkills, initialMedia = {} }) {
  const [items, setItems] = useState(initialSkills);
  const [mediaBySkill, setMediaBySkill] = useState(initialMedia);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [formValues, setFormValues] = useState({
    skillName: "",
    proficiencyLevel: "BEGINNER",
    proofLink: "",
  });

  function resetForm(formElement) {
    setEditingId("");
    setFormValues({
      skillName: "",
      proficiencyLevel: "BEGINNER",
      proofLink: "",
    });
    formElement?.reset();
  }

  async function saveSkill(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const payload = {
      skillName: formValues.skillName,
      proficiencyLevel: formValues.proficiencyLevel,
      proofLink: formValues.proofLink,
    };

    const response = await fetch(editingId ? `/api/skills/${editingId}` : "/api/skills", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not save skill.");
      setSaving(false);
      return;
    }

    let uploadedMedia = [];
    const targetSkillId = data.skill.id;
    const files = form.getAll("files").filter((file) => file && file.size > 0);
    if (files.length) {
      const uploadForm = new FormData();
      uploadForm.set("relatedType", "SKILL");
      uploadForm.set("relatedId", targetSkillId);
      uploadForm.set("category", form.get("category") || "Certificate");
      files.forEach((file) => uploadForm.append("files", file));

      const uploadResponse = await fetch("/api/media", {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setItems(editingId ? items.map((item) => (item.id === targetSkillId ? data.skill : item)) : [data.skill, ...items]);
        setMediaBySkill({ ...mediaBySkill, [targetSkillId]: mediaBySkill[targetSkillId] || [] });
        setMessage(uploadData.error || "Skill saved, but proof upload failed.");
        setSaving(false);
        return;
      }

      uploadedMedia = uploadData.media || [];
    }

    setItems(editingId ? items.map((item) => (item.id === targetSkillId ? data.skill : item)) : [data.skill, ...items]);
    setMediaBySkill({
      ...mediaBySkill,
      [targetSkillId]: [...uploadedMedia, ...(mediaBySkill[targetSkillId] || [])],
    });
    resetForm(formElement);
    setSaving(false);
  }

  async function toggleVisibility(item) {
    const res = await fetch(`/api/skills/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(i => i.id === item.id ? (data.skills || Object.values(data)[0]) : i));
    }
  }

  async function deleteSkill(id) {
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaBySkill };
    delete updated[id];
    setMediaBySkill(updated);
  }

  function startEdit(skill) {
    setMessage("");
    setEditingId(skill.id);
    setFormValues({
      skillName: skill.skillName || "",
      proficiencyLevel: skill.proficiencyLevel || "BEGINNER",
      proofLink: skill.proofLink || "",
    });
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[420px_1fr]">
      <Card className="h-fit p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{editingId ? "Edit skill" : "Add skill"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {editingId ? "Update the skill details and attach more proof files." : "Add the skill and attach certificate, screenshot, or course proof in one step."}
            </p>
          </div>
          {editingId ? (
            <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => resetForm()} title="Cancel edit">
              <X size={16} />
            </button>
          ) : null}
        </div>
        <form className="mt-5 grid gap-4" onSubmit={saveSkill}>
          <Field label="Skill name">
            <Input
              name="skillName"
              value={formValues.skillName}
              onChange={(event) => setFormValues({ ...formValues, skillName: event.target.value })}
              placeholder="Market Research"
              required
            />
          </Field>
          <Field label="Proficiency">
            <Select
              name="proficiencyLevel"
              value={formValues.proficiencyLevel}
              onChange={(event) => setFormValues({ ...formValues, proficiencyLevel: event.target.value })}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </Field>
          <Field label="Proof link">
            <Input
              name="proofLink"
              value={formValues.proofLink}
              onChange={(event) => setFormValues({ ...formValues, proofLink: event.target.value })}
              placeholder="Project, certificate, or achievement link"
            />
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-bold text-slate-950">Upload proof</h3>
            <p className="mt-1 text-sm text-slate-600">Optional images or PDFs. Max 8 MB per file.</p>
            <div className="mt-4 grid gap-3">
              <Field label="Proof type">
                <Select name="category" defaultValue="Certificate">
                  {skillMediaCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Files">
                <input
                  name="files"
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  className="min-h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </Field>
            </div>
          </div>
          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button disabled={saving}>
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            {saving ? "Saving..." : editingId ? "Update Skill" : "Save Skill"}
          </Button>
          {editingId ? (
            <button type="button" className="min-h-11 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50" onClick={() => resetForm()}>
              Cancel Edit
            </button>
          ) : null}
        </form>
      </Card>
      <div className="grid content-start gap-4">
        <div>
          <h2 className="text-xl font-bold">Saved skill sets</h2>
          <p className="mt-1 text-sm text-slate-600">Your saved skills and attached proof files appear here.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((skill) => (
            <Card key={skill.id} className={`p-5 ${skill.isHidden ? "opacity-50 grayscale" : ""}`}>
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{skill.skillName}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#4F46E5]">{skill.proficiencyLevel}</p>
                  {skill.proofLink ? (
                    <a href={skill.proofLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#4F46E5]">
                      <span className="truncate">Open proof link</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">Proof link not added.</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => startEdit(skill)} title="Edit skill">
                    <Pencil size={16} />
                  </button>
                  <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => toggleVisibility(skill)} title={skill.isHidden ? "Show on profile" : "Hide from profile"}>{skill.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteSkill(skill.id)} title="Delete skill">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <SkillProofList media={mediaBySkill[skill.id] || []} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
