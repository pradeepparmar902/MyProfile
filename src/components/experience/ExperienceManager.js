"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Save, Trash2, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

const proofCategories = ["Offer Letter", "Certificate", "Experience Letter", "Promotion Letter", "Work Photo", "Payslip", "Document", "Other"];

const emptyForm = {
  companyName: "",
  designation: "",
  employmentType: "FULL_TIME",
  location: "",
  joiningDate: "",
  completionDate: "",
  isCurrent: false,
  promotion: "",
  responsibilities: "",
  achievements: "",
  companyWebsite: "",
};

export function ExperienceManager({ title, description, apiPath, relatedType, initialItems, initialMedia = {} }) {
  const [items, setItems] = useState(initialItems);
  const [mediaByItem, setMediaByItem] = useState(initialMedia);
  const [editingId, setEditingId] = useState("");
  const [formValues, setFormValues] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setFormValues({ ...formValues, [field]: value });
  }

  function resetForm(formElement) {
    setEditingId("");
    setFormValues(emptyForm);
    setMessage("");
    formElement?.reset();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setMessage("");
    setFormValues({
      companyName: item.companyName || "",
      designation: item.designation || "",
      employmentType: item.employmentType || "FULL_TIME",
      location: item.location || "",
      joiningDate: item.joiningDate || "",
      completionDate: item.completionDate || "",
      isCurrent: Boolean(item.isCurrent),
      promotion: item.promotion || "",
      responsibilities: item.responsibilities || "",
      achievements: item.achievements || "",
      companyWebsite: item.companyWebsite || "",
    });
  }

  async function saveExperience(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const payload = {
      ...formValues,
      completionDate: formValues.isCurrent ? "" : formValues.completionDate,
    };

    const response = await fetch(editingId ? `${apiPath}/${editingId}` : apiPath, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not save this experience.");
      setSaving(false);
      return;
    }

    const savedItem = data.item;
    let uploadedMedia = [];
    const files = form.getAll("files").filter((file) => file && file.size > 0);

    if (files.length) {
      const uploadForm = new FormData();
      uploadForm.set("relatedType", relatedType);
      uploadForm.set("relatedId", savedItem.id);
      uploadForm.set("category", form.get("category") || "Document");
      files.forEach((file) => uploadForm.append("files", file));

      const uploadResponse = await fetch("/api/media", {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setItems(editingId ? items.map((item) => (item.id === savedItem.id ? savedItem : item)) : [savedItem, ...items]);
        setMediaByItem({ ...mediaByItem, [savedItem.id]: mediaByItem[savedItem.id] || [] });
        setMessage(uploadData.error || "Details saved, but proof upload failed.");
        setSaving(false);
        return;
      }

      uploadedMedia = uploadData.media || [];
    }

    setItems(editingId ? items.map((item) => (item.id === savedItem.id ? savedItem : item)) : [savedItem, ...items]);
    setMediaByItem({
      ...mediaByItem,
      [savedItem.id]: [...uploadedMedia, ...(mediaByItem[savedItem.id] || [])],
    });
    resetForm(formElement);
    setSaving(false);
  }

  async function toggleVisibility(item) {
    const res = await fetch(`${apiPath}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(i => i.id === item.id ? (Object.values(data)[0] || item) : i));
    }
  }

  async function deleteExperience(id) {
    await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByItem };
    delete updated[id];
    setMediaByItem(updated);
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[460px_1fr]">
      <Card className="h-fit p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{editingId ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          {editingId ? (
            <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => resetForm()} title="Cancel edit">
              <X size={16} />
            </button>
          ) : null}
        </div>

        <form className="mt-5 grid gap-4" onSubmit={saveExperience}>
          <Field label="Company name">
            <Input value={formValues.companyName} onChange={(event) => updateField("companyName", event.target.value)} placeholder="Company or organization" required />
          </Field>
          <Field label="Designation">
            <Input value={formValues.designation} onChange={(event) => updateField("designation", event.target.value)} placeholder="Marketing Intern, Analyst, Manager" required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Work type">
              <Select value={formValues.employmentType} onChange={(event) => updateField("employmentType", event.target.value)}>
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
                <option value="CONTRACT">Contract</option>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={formValues.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Mumbai, Remote" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Joining date">
              <Input type="date" value={formValues.joiningDate} onChange={(event) => updateField("joiningDate", event.target.value)} />
            </Field>
            <Field label="Completion date">
              <Input type="date" value={formValues.completionDate} onChange={(event) => updateField("completionDate", event.target.value)} disabled={formValues.isCurrent} />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={formValues.isCurrent} onChange={(event) => updateField("isCurrent", event.target.checked)} />
            Currently working here
          </label>
          <Field label="Promotion / growth">
            <Input value={formValues.promotion} onChange={(event) => updateField("promotion", event.target.value)} placeholder="Promoted to Team Lead, stipend increase, role change" />
          </Field>
          <Field label="Responsibilities">
            <Textarea value={formValues.responsibilities} onChange={(event) => updateField("responsibilities", event.target.value)} placeholder="What work did you handle?" />
          </Field>
          <Field label="Achievements">
            <Textarea value={formValues.achievements} onChange={(event) => updateField("achievements", event.target.value)} placeholder="Impact, numbers, awards, appreciation, learning" />
          </Field>
          <Field label="Company website">
            <Input value={formValues.companyWebsite} onChange={(event) => updateField("companyWebsite", event.target.value)} placeholder="https://company.com" />
          </Field>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-bold text-slate-950">Upload proof</h3>
            <p className="mt-1 text-sm text-slate-600">Upload certificates, offer letters, promotion letters, photos, or PDFs.</p>
            <div className="mt-4 grid gap-3">
              <Field label="Proof type">
                <Select name="category" defaultValue={proofCategories[0]}>
                  {proofCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Files">
                <input name="files" type="file" accept="image/*,.pdf,application/pdf" multiple className="min-h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" />
              </Field>
            </div>
          </div>

          {message ? <p className="text-sm font-semibold text-red-600">{message}</p> : null}
          <Button disabled={saving}>
            {editingId ? <Save size={16} /> : <Plus size={16} />}
            {saving ? "Saving..." : editingId ? "Update Details" : "Save Details"}
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
          <h2 className="text-xl font-bold">Saved {title.toLowerCase()} records</h2>
          <p className="mt-1 text-sm text-slate-600">Company details, role history, promotions, and proof files appear here.</p>
        </div>
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#4F46E5]">{formatDate(item.joiningDate)} - {item.isCurrent ? "Present" : formatDate(item.completionDate)}</p>
                  <h3 className="mt-2 text-lg font-bold">{item.designation}</h3>
                  <p className="mt-1 font-semibold text-slate-700">{item.companyName}</p>
                  <p className="mt-2 text-sm text-slate-600">{[item.employmentType?.replace("_", " "), item.location].filter(Boolean).join(" · ")}</p>
                  {item.promotion ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Promotion:</span> {item.promotion}</p> : null}
                  {item.responsibilities ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Responsibilities:</span> {item.responsibilities}</p> : null}
                  {item.achievements ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Achievements:</span> {item.achievements}</p> : null}
                  {item.companyWebsite ? (
                    <a href={item.companyWebsite} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5]">
                      Company website <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => startEdit(item)} title="Edit record">
                    <Pencil size={16} />
                  </button>
                  <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => toggleVisibility(item)} title={item.isHidden ? "Show on profile" : "Hide from profile"}>{item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteExperience(item.id)} title="Delete record">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <MediaGallery title="Proof Gallery" relatedType={relatedType} relatedId={item.id} initialMedia={mediaByItem[item.id] || []} categories={proofCategories} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not set";
  return value;
}
