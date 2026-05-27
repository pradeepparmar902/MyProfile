"use client";

import { useState } from "react";
import { Linkedin, CheckCircle2, AlertCircle, Unlink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LinkedInConnectInner({ isConnected }) {
  const [connected, setConnected] = useState(isConnected);
  const [disconnecting, setDisconnecting] = useState(false);
  const [msg, setMsg] = useState("");
  const searchParams = useSearchParams();
  const status = searchParams.get("linkedin");

  const statusMessages = {
    connected: "✓ LinkedIn connected successfully!",
    denied: "LinkedIn connection was cancelled.",
    error: "Something went wrong. Please try again.",
  };

  async function disconnect() {
    setDisconnecting(true);
    const res = await fetch("/api/linkedin/post", { method: "DELETE" });
    if (res.ok) {
      setConnected(false);
      setMsg("LinkedIn disconnected.");
    } else {
      setMsg("Failed to disconnect. Try again.");
    }
    setDisconnecting(false);
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#0077B5]">
          <Linkedin size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">LinkedIn Integration</h2>
          <p className="text-sm text-slate-500">Share your achievements and education directly to LinkedIn</p>
        </div>
      </div>

      {status && statusMessages[status] && (
        <div className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
          status === "connected" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {status === "connected" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {statusMessages[status]}
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          {msg}
        </div>
      )}

      <div className="mt-6">
        {connected ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <CheckCircle2 size={18} />
              LinkedIn account is connected
            </div>
            <div className="flex gap-3">
              <button
                onClick={disconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Unlink size={14} />
                {disconnecting ? "Disconnecting…" : "Disconnect LinkedIn"}
              </button>
              <a
                href="/api/auth/linkedin"
                className="flex items-center gap-2 rounded-lg border border-[#0077B5] px-4 py-2 text-sm font-semibold text-[#0077B5] transition hover:bg-[#0077B5] hover:text-white"
              >
                <Linkedin size={14} />
                Reconnect
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 leading-6">
              <strong className="block text-slate-800 mb-1">What you can do after connecting:</strong>
              <ul className="list-disc list-inside space-y-1">
                <li>Share education entries as LinkedIn posts with one click</li>
                <li>Auto-generate a professional announcement for each entry</li>
                <li>Open LinkedIn with your education pre-filled to add to your profile</li>
              </ul>
            </div>
            <a
              href="/api/auth/linkedin"
              className="flex w-fit items-center gap-2 rounded-xl bg-[#0077B5] px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-[#005f91] hover:shadow-md"
            >
              <Linkedin size={16} />
              Connect LinkedIn Account
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function LinkedInConnect({ isConnected }) {
  return (
    <Suspense fallback={<div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />}>
      <LinkedInConnectInner isConnected={isConnected} />
    </Suspense>
  );
}
