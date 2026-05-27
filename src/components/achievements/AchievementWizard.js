"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";
import { categories } from "@/lib/data";

const steps = ["Basics", "Problem", "Thinking", "Execution", "Result", "Learning", "Proof"];
const proofCategories = ["Certificate", "Honour Photo", "Award Photo", "Project Proof", "Media Coverage", "Other"];

export function AchievementWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedAchievement, setSavedAchievement] = useState(null);
  const [form, setForm] = useState({
    title: "Built a campus survey that improved event attendance",
    category: "Leadership",
    skills: "Research, Communication, Leadership",
    problem: "Student events had low attendance because topics were selected without understanding what students wanted.",
    thinking: "",
    execution: "",
    result: "Attendance increased from 70 to 142 students in the next event.",
    metrics: "103% attendance growth",
    learning: "",
    proof: "https://example.com/survey-proof",
  });

  const skillList = useMemo(() => form.skills.split(",").map((item) => item.trim()).filter(Boolean), [form.skills]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(status = "PUBLISHED", stayOnProof = false) {
    setSaving(true);
    setMessage("");
    const response = await fetch(savedAchievement ? `/api/achievements/${savedAchievement.id}` : "/api/achievements", {
      method: savedAchievement ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        category: form.category,
        skillsUsed: form.skills,
        problemStatement: form.problem,
        thinkingProcess: form.thinking,
        executionProcess: form.execution,
        result: form.result,
        metrics: form.metrics,
        learning: form.learning,
        proofLink: form.proof,
        status,
      }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error || "Could not save achievement.");
      return;
    }
    const achievement = data.achievement;
    setSavedAchievement(achievement);
    if (stayOnProof) {
      setMessage("Achievement saved. You can upload certificates, photos, or PDFs now.");
      return;
    }
    router.push("/dashboard/achievements");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
      <Card className="p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#4F46E5]">Step {step + 1} of {steps.length}</p>
          <h2 className="mt-1 text-2xl font-bold">{steps[step]}</h2>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {steps.map((item, index) => (
              <div key={item} className={`h-2 rounded-full ${index <= step ? "bg-[#4F46E5]" : "bg-slate-100"}`} />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {step === 0 ? (
            <>
              <Field label="Title"><Input value={form.title} onChange={(event) => update("title", event.target.value)} /></Field>
              <Field label="Category">
                <Select value={form.category} onChange={(event) => update("category", event.target.value)}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </Select>
              </Field>
              <Field label="Skills used"><Input value={form.skills} onChange={(event) => update("skills", event.target.value)} /></Field>
            </>
          ) : null}
          {step === 1 ? <Field label="Problem statement"><Textarea value={form.problem} onChange={(event) => update("problem", event.target.value)} /></Field> : null}
          {step === 2 ? <Field label="Thinking process"><Textarea value={form.thinking} onChange={(event) => update("thinking", event.target.value)} placeholder="How did you approach the challenge?" /></Field> : null}
          {step === 3 ? <Field label="Execution process"><Textarea value={form.execution} onChange={(event) => update("execution", event.target.value)} placeholder="What did you actually do?" /></Field> : null}
          {step === 4 ? (
            <>
              <Field label="Result / impact"><Textarea value={form.result} onChange={(event) => update("result", event.target.value)} /></Field>
              <Field label="Metrics"><Input value={form.metrics} onChange={(event) => update("metrics", event.target.value)} /></Field>
            </>
          ) : null}
          {step === 5 ? <Field label="Learnings"><Textarea value={form.learning} onChange={(event) => update("learning", event.target.value)} placeholder="What did this teach you?" /></Field> : null}
          {step === 6 ? (
            <>
              <Field label="Proof link">
                <Input value={form.proof} onChange={(event) => update("proof", event.target.value)} />
              </Field>
              {!savedAchievement ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Want to upload certificate/photos?</p>
                  <p className="mt-1 text-sm text-slate-600">Save this achievement first, then upload proof files here.</p>
                  <Button className="mt-3" onClick={() => save("DRAFT", true)} disabled={saving}>
                    {saving ? "Saving..." : "Save & Enable Uploads"}
                  </Button>
                </div>
              ) : (
                <MediaGallery
                  title="Proof Uploads"
                  relatedType="ACHIEVEMENT"
                  relatedId={savedAchievement.id}
                  initialMedia={[]}
                  categories={proofCategories}
                  compact
                />
              )}
            </>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={16} /> Back</Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => save("DRAFT")} disabled={saving}>Save Draft</Button>
            {step === steps.length - 1 ? (
              <Button onClick={() => save("PUBLISHED")} disabled={saving}><Check size={16} /> {saving ? "Saving..." : "Publish"}</Button>
            ) : (
              <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next <ArrowRight size={16} /></Button>
            )}
          </div>
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-red-600">{message}</p> : null}
      </Card>
      <Card className="h-fit p-6">
        <p className="text-sm font-semibold text-[#4F46E5]">Live preview</p>
        <h3 className="mt-4 text-xl font-bold">{form.title || "Achievement title"}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{form.category}</Badge>
          {form.metrics ? <Badge>{form.metrics}</Badge> : null}
        </div>
        <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-600">
          <p><span className="font-semibold text-slate-900">Problem:</span> {form.problem || "Describe the challenge."}</p>
          <p><span className="font-semibold text-slate-900">Result:</span> {form.result || "Share what changed."}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {skillList.map((skill) => <Badge key={skill}>{skill}</Badge>)}
        </div>
      </Card>
    </div>
  );
}
