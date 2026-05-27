"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

const proofCategories = ["Business License", "Certificate", "Client Testimonial", "Work Photo", "Project Document", "Other"];

const emptyForm = {
  companyName: "",
  designation: "",
  employmentType: "SELF_BUSINESS",
  location: "",
  joiningDate: "",
  completionDate: "",
  isCurrent: false,
  promotion: "",
  responsibilities: "",
  achievements: "",
  companyWebsite: "",
};

export function SelfBusinessManager({ title, description, apiPath, relatedType, initialItems, initialMedia = {} }) {
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
      employmentType: item.employmentType || "SELF_BUSINESS",
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

  async function deleteExperience(id) {
    await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByItem };
    delete updated[id];
    setMediaByItem(updated);
  }

  function getCategoryLabel(type) {
    switch (type) {
      case "SELF_BUSINESS":
        return "Self Business";
      case "FREELANCE":
        return "Freelance";
      case "TRAINING":
        return "Professional Training";
      case "CONSULTING":
        return "Consulting";
      case "OTHER":
        return "Other";
      default:
        return "Self Business";
    }
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[460px_1fr]">
      <Card className="h-fit p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{editingId ? `Edit details` : `Add details`}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          {editingId ? (
            <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => resetForm()} title="Cancel edit">
              <X size={16} />
            </button>
          ) : null}
        </div>

        <form className="mt-5 grid gap-4" onSubmit={saveExperience}>
          <Field label="Business / Program name">
            <Input value={formValues.companyName} onChange={(event) => updateField("companyName", event.target.value)} placeholder="e.g. My Startup, Creative Agency, Marketing Academy" required />
          </Field>
          <Field label="Role / Specialization">
            <Input value={formValues.designation} onChange={(event) => updateField("designation", event.target.value)} placeholder="e.g. Founder, Freelance Developer, Trainee Student" required />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category / Type">
              <Select value={formValues.employmentType} onChange={(event) => updateField("employmentType", event.target.value)}>
                <option value="SELF_BUSINESS">Self Business</option>
                <option value="FREELANCE">Freelance</option>
                <option value="TRAINING">Professional Training</option>
                <option value="CONSULTING">Consulting</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={formValues.location} onChange={(event) => updateField("location", event.target.value)} placeholder="e.g. Mumbai, Remote, Online" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start date">
              <Input type="date" value={formValues.joiningDate} onChange={(event) => updateField("joiningDate", event.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={formValues.completionDate} onChange={(event) => updateField("completionDate", event.target.value)} disabled={formValues.isCurrent} />
            </Field>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={formValues.isCurrent} onChange={(event) => updateField("isCurrent", event.target.checked)} />
            Ongoing / currently active
          </label>
          <Field label="Key Milestones / Outcomes">
            <Input value={formValues.promotion} onChange={(event) => updateField("promotion", event.target.value)} placeholder="e.g. Completed 10 projects, hit 1K revenue, earned certificate" />
          </Field>
          <Field label="Responsibilities / Details">
            <Textarea value={formValues.responsibilities} onChange={(event) => updateField("responsibilities", event.target.value)} placeholder="What work, client tasks, or training topics did you handle?" />
          </Field>
          <Field label="Achievements / Key results">
            <Textarea value={formValues.achievements} onChange={(event) => updateField("achievements", event.target.value)} placeholder="What measurable results or key outcomes did you achieve?" />
          </Field>
          <Field label="Website or project link">
            <Input value={formValues.companyWebsite} onChange={(event) => updateField("companyWebsite", event.target.value)} placeholder="https://mybusiness.com or project link" />
          </Field>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-bold text-slate-950">Upload proof</h3>
            <p className="mt-1 text-sm text-slate-600">Upload certificates, testimonials, client reviews, photos, or PDFs.</p>
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
          <p className="mt-1 text-sm text-slate-600">Business details, roles, milestones, and proof files appear here.</p>
        </div>
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#4F46E5]">{formatDate(item.joiningDate)} - {item.isCurrent ? "Present" : formatDate(item.completionDate)}</p>
                  <h3 className="mt-2 text-lg font-bold">{item.designation}</h3>
                  <p className="mt-1 font-semibold text-slate-700">{item.companyName}</p>
                  <p className="mt-2 text-sm text-slate-600">{[getCategoryLabel(item.employmentType), item.location].filter(Boolean).join(" · ")}</p>
                  {item.promotion ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Milestones:</span> {item.promotion}</p> : null}
                  {item.responsibilities ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Responsibilities / Details:</span> {item.responsibilities}</p> : null}
                  {item.achievements ? <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Key Results:</span> {item.achievements}</p> : null}
                  {item.companyWebsite ? (
                    <a href={item.companyWebsite} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4F46E5]">
                      Website / Project Link <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => startEdit(item)} title="Edit record">
                    <Pencil size={16} />
                  </button>
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
