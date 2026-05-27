"use client";

import { useState } from "react";
import { ExternalLink, FileText, ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";

export function MediaGallery({ title = "Gallery", relatedType, relatedId, initialMedia = [], categories = [], compact = false, readOnly = false }) {
  const [media, setMedia] = useState(initialMedia);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(event) {
    event.preventDefault();
    setMessage("");
    setUploading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.set("relatedType", relatedType);
    form.set("relatedId", relatedId);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 40000);

    try {
      const response = await fetch("/api/media", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not upload files.");
        return;
      }

      setMedia([...data.media, ...media]);
      formElement.reset();
    } catch {
      setMessage("Upload took too long or failed. Please try a smaller file, or check Firebase Storage rules.");
    } finally {
      window.clearTimeout(timeout);
      setUploading(false);
    }
  }

  async function deleteMedia(id) {
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    setMedia(media.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {readOnly ? "Saved proof files for this item." : "Upload images or PDFs as proof. Max 8 MB per file."}
        </p>
      </div>

      {!readOnly ? (
        <form className={compact ? "grid gap-3" : "grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_auto]"} onSubmit={uploadFiles}>
          <Field label="Type">
            <Select name="category" defaultValue={categories[0] || "Other"}>
              {categories.map((category) => (
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
              required
            />
          </Field>
          <Button type="submit" className={compact ? "w-full" : "self-end"} disabled={uploading}>
            <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      ) : null}
      {message ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{message}</p> : null}

      <div className={compact ? "mt-4 grid gap-3" : "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="block">
              {item.fileType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.fileUrl} alt={item.fileName} className={compact ? "h-28 w-full object-cover" : "h-36 w-full object-cover"} />
              ) : (
                <div className={compact ? "grid h-28 place-items-center bg-slate-100 text-slate-500" : "grid h-36 place-items-center bg-slate-100 text-slate-500"}>
                  <FileText size={34} />
                </div>
              )}
            </a>
            <div className="p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#4F46E5]">
                {item.fileType === "IMAGE" ? <ImageIcon size={14} /> : <FileText size={14} />}
                {item.category}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{item.fileName}</p>
              <div className="mt-3 flex items-center justify-between">
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                  Open <ExternalLink size={14} />
                </a>
                {!readOnly ? (
                  <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteMedia(item.id)} title="Delete file">
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {!media.length ? (
          <p className={compact ? "rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600" : "rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600 sm:col-span-2 xl:col-span-3"}>
            No files uploaded yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
