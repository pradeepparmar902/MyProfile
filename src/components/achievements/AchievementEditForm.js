"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { MediaGallery } from "@/components/media/MediaGallery";
import { categories } from "@/lib/data";

const proofCategories = ["Certificate", "Honour Photo", "Award Photo", "Project Proof", "Media Coverage", "Other"];

export function AchievementEditForm({ achievement, media = [] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/achievements/${achievement.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Could not update achievement.");
      return;
    }

    router.push(`/dashboard/achievements/${achievement.id}`);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Title">
          <Input name="title" defaultValue={achievement.title} required />
        </Field>
        <Field label="Category">
          <Select name="category" defaultValue={achievement.category}>
            {categories.map((category) => (
              <option key={category} value={category.toUpperCase().replaceAll(" ", "_")}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Problem statement">
          <Textarea name="problemStatement" defaultValue={achievement.problemStatement || ""} />
        </Field>
        <Field label="Thinking process">
          <Textarea name="thinkingProcess" defaultValue={achievement.thinkingProcess || ""} />
        </Field>
        <Field label="Execution process">
          <Textarea name="executionProcess" defaultValue={achievement.executionProcess || ""} />
        </Field>
        <Field label="Result / impact">
          <Textarea name="result" defaultValue={achievement.result || ""} />
        </Field>
        <Field label="Metrics">
          <Input name="metrics" defaultValue={achievement.metrics || ""} />
        </Field>
        <Field label="Learning">
          <Textarea name="learning" defaultValue={achievement.learning || ""} />
        </Field>
        <Field label="Skills used">
          <Input name="skillsUsed" defaultValue={achievement.skillsUsed || ""} />
        </Field>
        <Field label="Proof link">
          <Input name="proofLink" defaultValue={achievement.proofLink || ""} />
        </Field>
        <MediaGallery
          title="Proof Uploads"
          relatedType="ACHIEVEMENT"
          relatedId={achievement.id}
          initialMedia={media}
          categories={proofCategories}
          compact
        />
        <Field label="Status">
          <Select name="status" defaultValue={achievement.status}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </Field>
        {message ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{message}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          <Button href={`/dashboard/achievements/${achievement.id}`} variant="secondary">Cancel</Button>
        </div>
      </form>
    </Card>
  );
}
