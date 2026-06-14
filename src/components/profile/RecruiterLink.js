"use client";

import { useState, useEffect } from "react";
import { Link2, Trash2, Plus, Copy, Mail, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";

export function RecruiterLink({ username }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState("GENERAL");
  const [allowedEmail, setAllowedEmail] = useState("");
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  async function fetchInvites() {
    try {
      const res = await fetch("/api/profile/invites");
      const data = await res.json();
      if (res.ok) setInvites(data.invites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.host);
    fetchInvites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const res = await fetch("/api/profile/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, allowedEmail: type === "SPECIFIC" ? allowedEmail : undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invite");
      } else {
        setInvites([data.invite, ...invites]);
        setAllowedEmail("");
        setType("GENERAL");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id) {
    try {
      const res = await fetch(`/api/profile/invites/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvites(invites.filter((inv) => inv.id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to revoke: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred while revoking.");
    }
  }

  function copyLink(id) {
    if (!username) {
      alert("Please save your public profile username first before sharing links!");
      return;
    }
    const link = `${window.location.origin}/invite/${username}/${id}`;
    navigator.clipboard.writeText(link);
    alert("Copied to clipboard!");
  }

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Link2 size={20} />
          Recruiter Invite Links
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Generate secure, read-only links for recruiters to view your full portfolio.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mt-5 grid gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
        <h3 className="font-semibold">Create New Invite</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Link Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="GENERAL">General (Anyone with link)</option>
              <option value="SPECIFIC">Specific Recruiter (Email required)</option>
            </Select>
          </Field>
          {type === "SPECIFIC" && (
            <Field label="Recruiter Email">
              <Input 
                type="email" 
                placeholder="recruiter@company.com" 
                value={allowedEmail} 
                onChange={(e) => setAllowedEmail(e.target.value)}
                required
              />
            </Field>
          )}
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <Button disabled={creating} className="w-fit">
          <Plus size={16} />
          {creating ? "Creating..." : "Generate Link"}
        </Button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Active Invites</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No active invite links.</p>
        ) : (
          <div className="grid gap-3">
            {invites.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-mono text-sm font-semibold bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-2">
                    {inv.type === "GENERAL" ? <Globe size={14} className="text-emerald-600"/> : <Mail size={14} className="text-[#4F46E5]"/>}
                    {username ? `${origin}/invite/${username}/${inv.id}` : inv.id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {inv.type === "GENERAL" ? "Anyone with the link can view." : `Restricted to: ${inv.allowedEmail}`}
                    {inv.createdAt && ` • Created on ${new Date(inv.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => copyLink(inv.id)}>
                    <Copy size={16} /> Copy Link
                  </Button>
                  <Button variant="danger" onClick={() => handleRevoke(inv.id)} className="bg-red-50 text-red-600 hover:bg-red-100 border-transparent">
                    <Trash2 size={16} /> Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
