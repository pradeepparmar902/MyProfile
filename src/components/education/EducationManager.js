"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Plus, Trash2, Share2, ExternalLink } from "lucide-react";

function LinkedinIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";

export function EducationManager({ initialEducation, initialMedia = [] }) {
  const [items, setItems] = useState(initialEducation);
  const [mediaByEducation, setMediaByEducation] = useState(initialMedia);
  const [message, setMessage] = useState("");
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [postMessage, setPostMessage] = useState({});

  useEffect(() => {
    fetch("/api/linkedin/status")
      .then((r) => r.json())
      .then((d) => setLinkedinConnected(d.connected))
      .catch(() => {});
  }, []);

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

  async function toggleVisibility(item) {
    const res = await fetch(`/api/education/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isHidden: !item.isHidden }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(items.map(i => i.id === item.id ? (data.education || Object.values(data)[0]) : i));
    }
  }

  async function deleteEducation(id) {
    await fetch(`/api/education/${id}`, { method: "DELETE" });
    setItems(items.filter((item) => item.id !== id));
    const updated = { ...mediaByEducation };
    delete updated[id];
    setMediaByEducation(updated);
  }

  async function shareToLinkedIn(item) {
    if (!linkedinConnected) {
      window.location.href = "/dashboard/settings?tab=linkedin";
      return;
    }

    setPostingId(item.id);
    setPostMessage((prev) => ({ ...prev, [item.id]: "" }));

    const degree = item.degree || "";
    const field = item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : "";
    const school = item.institutionName || "";
    const years =
      item.startYear && item.endYear
        ? ` (${item.startYear}–${item.endYear})`
        : item.startYear
        ? ` (${item.startYear})`
        : "";
    const grade = item.grade ? `\nGrade: ${item.grade}` : "";

    const text = `🎓 Excited to share my education journey!\n\nI studied ${degree}${field} at ${school}${years}.${grade}\n\nCheck out my full portfolio at datacraze.tech\n\n#Education #Learning #Growth`;

    const itemMedia = mediaByEducation[item.id] || [];
    const mediaUrls = itemMedia.filter(m => m.fileType === "IMAGE").map(m => m.fileUrl);

    const res = await fetch("/api/linkedin/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mediaUrls }),
    });
    const data = await res.json();

    setPostingId(null);
    if (res.ok) {
      setPostMessage((prev) => ({ ...prev, [item.id]: "✓ Posted to LinkedIn!" }));
    } else {
      setPostMessage((prev) => ({ ...prev, [item.id]: data.error || "Failed to post." }));
    }
    setTimeout(() => setPostMessage((prev) => ({ ...prev, [item.id]: "" })), 5000);
  }

  function openLinkedInProfile(item) {
    const params = new URLSearchParams({
      startTask: "EDUCATION",
      school: item.institutionName || "",
      degree: item.degree || "",
      fieldOfStudy: item.fieldOfStudy || "",
      startYear: item.startYear || "",
      endYear: item.endYear || "",
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank");
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

        {!linkedinConnected && (
          <div className="mt-6 rounded-xl border border-[#0077B5]/30 bg-[#0077B5]/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0077B5]">
              <LinkedinIcon size={16} />
              LinkedIn not connected
            </div>
            <p className="mt-1 text-xs text-slate-500">Connect your LinkedIn account to share education entries directly to your feed.</p>
            <a
              href="/api/auth/linkedin"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0077B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005f91]"
            >
              <LinkedinIcon size={14} />
              Connect LinkedIn
            </a>
          </div>
        )}
      </Card>

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`p-5 ${item.isHidden ? "opacity-50 grayscale" : ""}`}>
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#4F46E5]">{item.startYear || ""} - {item.endYear || ""}</p>
                <h3 className="mt-1 text-lg font-bold">{item.institutionName}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700">{item.degree} {item.fieldOfStudy ? `· ${item.fieldOfStudy}` : ""}</p>
                <p className="mt-2 text-sm text-slate-600">{item.grade}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => toggleVisibility(item)} title={item.isHidden ? "Show on profile" : "Hide from profile"}>{item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              <button className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => deleteEducation(item.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>

            {/* LinkedIn Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => shareToLinkedIn(item)}
                disabled={postingId === item.id}
                className="flex items-center gap-2 rounded-lg border border-[#0077B5] px-3 py-1.5 text-xs font-semibold text-[#0077B5] transition hover:bg-[#0077B5] hover:text-white disabled:opacity-50"
                title={linkedinConnected ? "Share as a post on LinkedIn" : "Connect LinkedIn first"}
              >
                <Share2 size={13} />
                {postingId === item.id ? "Posting…" : "Share on LinkedIn"}
              </button>

              <button
                onClick={() => openLinkedInProfile(item)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#0077B5] hover:text-[#0077B5]"
                title="Add to your LinkedIn Education section"
              >
                <ExternalLink size={13} />
                Add to LinkedIn Profile
              </button>

              {postMessage[item.id] && (
                <span
                  className={`text-xs font-semibold ${
                    postMessage[item.id].startsWith("✓") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {postMessage[item.id]}
                </span>
              )}
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
