import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";

const errors = {
  "account-exists": "This email already has an account. Please login.",
  "missing-fields": "Please enter email and password.",
  "invalid-login": "Invalid email or password.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = errors[params?.error] || "";
  const email = params?.email || "";

  return (
    <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white"><Sparkles size={20} /></span>
          <div>
            <h1 className="text-xl font-bold">Welcome back</h1>
            <p className="text-sm text-slate-500">Continue building your career identity.</p>
          </div>
        </div>
        <form className="grid gap-4" action="/api/auth/login-form" method="post">
          <Field label="Email"><Input name="email" type="email" placeholder="you@example.com" defaultValue={email} required /></Field>
          <Field label="Password"><Input name="password" type="password" placeholder="Enter your password" required /></Field>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          New to Proofolio? <a className="font-semibold text-[#4F46E5]" href="/register">Create account</a>
        </p>
      </Card>
    </main>
  );
}
