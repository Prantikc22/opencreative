"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, LoaderCircle } from "lucide-react";

export function CreativeCommand() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit() {
    if (prompt.trim().length < 5) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      sessionStorage.setItem("opencreative.command", JSON.stringify(data));
      router.push(data.route);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not understand that idea.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="creative-command-wrap">
      <div className="creative-command">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Describe what you want to create…"
          aria-label="Creative idea"
        />
        <div className="command-tools">
          <small>OpenCreative will route this to the right studio.</small>
          <button
            className="command-submit"
            onClick={submit}
            disabled={loading || prompt.trim().length < 5}
            aria-label="Create"
          >
            {loading ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
