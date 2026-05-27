"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";

export function ProfileEditor({ user, profile }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        username: form.get("username"),
        headline: form.get("headline"),
        bio: form.get("bio"),
        careerGoal: form.get("careerGoal"),
        location: form.get("location"),
        linkedinUrl: form.get("linkedinUrl"),
        githubUrl: form.get("githubUrl"),
        portfolioUrl: form.get("portfolioUrl"),
        emailVisible: form.get("emailVisible") === "on",
        isPublic: form.get("isPublic") === "on",
      }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "Could not save profile.");
      return;
    }

    setMessage("Profile saved.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 p-4 md:p-8 lg:grid-cols-[1fr_380px]">
      <Card className="p-6">
        <h2 className="text-xl font-bold">Identity details</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <Field label="Full name"><Input name="name" defaultValue={user.name} required /></Field>
          <Field label="Username"><Input name="username" defaultValue={profile?.username || ""} required /></Field>
          <Field label="Headline"><Input name="headline" defaultValue={profile?.headline || ""} /></Field>
          <Field label="Bio"><Textarea name="bio" defaultValue={profile?.bio || ""} /></Field>
          <Field label="Career goal"><Textarea name="careerGoal" defaultValue={profile?.careerGoal || ""} /></Field>
          <Field label="Location"><Input name="location" defaultValue={profile?.location || ""} /></Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="LinkedIn"><Input name="linkedinUrl" defaultValue={profile?.linkedinUrl || ""} /></Field>
            <Field label="GitHub"><Input name="githubUrl" defaultValue={profile?.githubUrl || ""} /></Field>
            <Field label="Portfolio"><Input name="portfolioUrl" defaultValue={profile?.portfolioUrl || ""} /></Field>
          </div>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700">
            Public profile
            <input name="isPublic" type="checkbox" defaultChecked={profile?.isPublic !== false} className="size-4" />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700">
            Show email publicly
            <input name="emailVisible" type="checkbox" defaultChecked={Boolean(profile?.emailVisible)} className="size-4" />
          </label>
          {message ? <p className="text-sm font-semibold text-[#4F46E5]">{message}</p> : null}
          <Button disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
        </form>
      </Card>
      <Card className="h-fit p-6">
        <p className="text-sm font-semibold text-[#4F46E5]">Live preview</p>
        <div className="mt-5 flex items-start gap-4">
          <div className="grid size-16 place-items-center rounded-lg bg-[#4F46E5] text-xl font-bold text-white">
            {user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{profile?.headline || "Add a headline"}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">{profile?.bio || "Add a short bio to explain your story."}</p>
        <Button href={`/profile/${profile?.username || "demo-student"}`} variant="secondary" className="mt-5 w-full">View Public Profile</Button>
      </Card>
    </div>
  );
}
