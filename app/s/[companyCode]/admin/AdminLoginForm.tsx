"use client";

import { useState, type FormEvent } from "react";

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" width="22">
      <rect height="11" rx="2" width="16" x="4" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function AdminLoginForm({ companyCode }: { companyCode: string }) {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pin.length !== 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message || json?.error || "Incorrect PIN");
        setPin("");
        return;
      }
      // Cookie is already set by the route handler — reload so the server component picks it up
      // and renders the dashboard instead of this form.
      window.location.reload();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="w-full max-w-xs space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5 text-center">
        <p className="font-heading text-lg font-semibold text-sf-ink">Admin access</p>
        <p className="text-sm text-sf-ink-soft">Enter the 6-digit PIN to edit this storefront.</p>
      </div>

      <input
        aria-label="6-digit PIN"
        autoFocus
        className="w-full rounded-lg border border-sf-line bg-sf-bg py-3 text-center text-2xl tracking-[0.6em] text-sf-ink outline-none focus:border-sf-ink-soft"
        inputMode="numeric"
        maxLength={6}
        onChange={(e) => {
          setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
          setError(null);
        }}
        placeholder="------"
        type="password"
        value={pin}
      />

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-sf-ink px-5 py-3 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        disabled={pin.length !== 6 || submitting}
        type="submit"
      >
        <LockIcon />
        {submitting ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
