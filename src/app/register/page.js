import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

const errors = {
  "missing-fields": "Please fill all required fields.",
  "password-mismatch": "Passwords do not match.",
  "password-short": "Password must be at least 6 characters.",
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const error = errors[params?.error] || "";

  return (
    <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white"><Sparkles size={20} /></span>
          <div>
            <h1 className="text-xl font-bold">Create your profile</h1>
            <p className="text-sm text-slate-500">Start with a simple student account.</p>
          </div>
        </div>
        <form className="grid gap-4" action="/api/auth/register-form" method="post">
          <Field label="Full name"><Input name="name" placeholder="Aarav Mehta" required /></Field>
          <Field label="Email"><Input name="email" type="email" placeholder="you@example.com" required /></Field>
          <Field label="Password"><Input name="password" type="password" placeholder="Create a password" required minLength={6} /></Field>
          <Field label="Confirm password"><Input name="confirmPassword" type="password" placeholder="Repeat password" required minLength={6} /></Field>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <a className="font-semibold text-[#4F46E5]" href="/login">Login</a>
        </p>
      </Card>
    </main>
  );
}
