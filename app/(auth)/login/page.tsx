"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    setLoading(false);
    setMessage(error ? error.message : "Check your email for a magic link.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-nao-line bg-white p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Nao Medical</p>
        <h1 className="mt-3 text-3xl font-semibold text-nao-ink">Trainual Completion Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with your NAO Medical email to access leadership reporting and data imports.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSignIn}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-nao-ink">Work email</span>
            <input
              className="w-full rounded-2xl border border-nao-line px-4 py-3 outline-none ring-nao-teal focus:ring-2"
              type="email"
              placeholder="name@naomedical.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button className="w-full rounded-full bg-nao-teal px-5 py-3 text-sm font-semibold text-white" disabled={loading} type="submit">
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>
  );
}
