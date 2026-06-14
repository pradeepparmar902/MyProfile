"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

export function SpecificInviteForm({ token }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/profile/invites/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Access denied.");
      } else {
        router.refresh(); // Refresh the page to load the profile data
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#4F46E5] text-white">
          <Mail size={24} />
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">Verify Your Email</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          This portfolio is protected. Please enter the email address the recruiter invite was sent to.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <Field label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recruiter@company.com"
              required
            />
          </Field>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <Button disabled={loading} className="w-full">
            {loading ? "Verifying..." : "View Portfolio"} <ArrowRight size={16} />
          </Button>
        </form>
      </Card>
    </div>
  );
}
