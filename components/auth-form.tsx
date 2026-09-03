"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot" | "update";

function authErrorMessage(cause: unknown) {
  const authError = cause as { code?: string; message?: string };

  if (authError?.code === "over_email_send_rate_limit") {
    return "Email delivery is temporarily at capacity. If you already have an account, sign in. Otherwise, please try again later.";
  }

  if (authError?.code === "email_address_not_authorized") {
    return "This email cannot receive confirmation messages yet. Please try again later or use an existing account.";
  }

  return cause instanceof Error ? cause.message : "Could not continue.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const copy = {
    login: ["Welcome back", "Continue creating where you left off."],
    signup: [
      "Make something impossible",
      "Start with 50 credits. No card required.",
    ],
    forgot: ["Reset your password", "We’ll send a secure recovery link."],
    update: ["Choose a new password", "Use at least 8 characters."],
  }[mode];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(params.get("next") || "/app");
        router.refresh();
      } else if (mode === "signup") {
        const desiredProduct = params.get("product") === "agents" ? "agents" : "creative";
        const desiredPlan = params.get("plan") || (desiredProduct === "agents" ? "agent-sandbox" : "free");
        const onboardingPath = `/onboarding?product=${desiredProduct}&plan=${encodeURIComponent(desiredPlan)}`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, desired_product: desiredProduct, desired_plan: desiredPlan },
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(onboardingPath)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push(onboardingPath);
          router.refresh();
        } else setMessage("Check your inbox to confirm your account.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setMessage("Recovery link sent. Check your inbox.");
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        router.push("/app");
        router.refresh();
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  async function magicLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/app`,
      },
    });
    setLoading(false);
    if (error) setError(authErrorMessage(error));
    else setMessage("Magic link sent. Check your inbox.");
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">OpenCreative Cloud</p>
      <h1>{copy[0]}</h1>
      <p className="auth-subtitle">{copy[1]}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === "signup" && (
          <label>
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
              placeholder="Your name"
            />
          </label>
        )}
        {mode !== "update" && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </label>
        )}
        {mode !== "forgot" && (
          <label>
            Password
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              placeholder="At least 8 characters"
            />
          </label>
        )}
        {mode === "login" && (
          <Link className="forgot-link" href="/forgot-password">
            Forgot password?
          </Link>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}
        <button className="button button-dark auth-submit" disabled={loading}>
          {loading ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <>
              {mode === "login"
                ? "Sign in"
                : mode === "signup"
                  ? "Create account"
                  : mode === "forgot"
                    ? "Send recovery link"
                    : "Update password"}
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
      {mode === "login" && (
        <button className="magic-button" onClick={magicLink} disabled={loading}>
          <Mail size={15} /> Email me a magic link
        </button>
      )}
      <p className="auth-switch">
        {mode === "login" ? (
          <>
            New here? <Link href="/signup">Create an account</Link>
          </>
        ) : mode === "signup" ? (
          <>
            Already have an account? <Link href="/login">Sign in</Link>
          </>
        ) : (
          <Link href="/login">Back to sign in</Link>
        )}
      </p>
    </div>
  );
}
