"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, name }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email already has an account. Please login.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <div className="grid gap-4" onKeyDown={(e) => e.key === 'Enter' && handleRegister(e)}>
          <Field label="Full Name">
            <Input 
              name="name" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </Field>
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
              placeholder="Create a password (min 6 characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6} 
            />
          </Field>
          <Field label="Confirm password">
            <Input 
              name="confirmPassword" 
              type="password" 
              placeholder="Repeat password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              minLength={6} 
            />
          </Field>
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          <Button onClick={handleRegister} className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account? <a className="font-semibold text-[#4F46E5]" href="/login">Login</a>
        </p>
      </Card>
    </main>
  );
}
