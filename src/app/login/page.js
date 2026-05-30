"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") ? "Please login to continue." : "");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      router.push("/dashboard");
      router.refresh(); 
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-[#4F46E5] text-white"><Sparkles size={20} /></span>
        <div>
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="text-sm text-slate-500">Continue building your career identity.</p>
        </div>
      </div>
      <div className="grid gap-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}>
        <Field label="Email">
          <Input 
            name="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </Field>
        <Field label="Password">
          <Input 
            name="password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </Field>
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
        <Button onClick={handleLogin} className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
      <p className="mt-5 text-center text-sm text-slate-600">
        New to Proofolio? <a className="font-semibold text-[#4F46E5]" href="/register">Create account</a>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 py-10">
      <Suspense fallback={<Card className="w-full max-w-md p-6 h-64 animate-pulse bg-white" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

