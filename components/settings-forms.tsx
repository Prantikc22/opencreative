"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";

export function ProfileSettings({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [fullName, setFullName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not save your profile.");
    else setSaved(true);
    setSaving(false);
  }
  return (
    <section>
      <h2>Profile</h2>
      <label className="form-field">
        Full name
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </label>
      <label className="form-field">
        Email
        <input value={email} disabled readOnly />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button
        className="button button-dark"
        onClick={save}
        disabled={saving || !fullName.trim()}
      >
        {saving ? (
          <LoaderCircle className="spin" size={15} />
        ) : saved ? (
          <Check size={15} />
        ) : null}
        {saving ? "Saving…" : saved ? "Saved" : "Save profile"}
      </button>
    </section>
  );
}

export function WorkspaceSettings({
  name,
  quality,
}: {
  name: string;
  quality: string;
}) {
  const [workspaceName, setWorkspaceName] = useState(name);
  const [defaultQuality, setDefaultQuality] = useState(quality);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceName, defaultQuality }),
    });
    const data = await response.json();
    if (!response.ok)
      setError(data.error || "Could not save workspace settings.");
    else setSaved(true);
    setSaving(false);
  }
  return (
    <section>
      <h2>Workspace</h2>
      <label className="form-field">
        Studio name
        <input
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
        />
      </label>
      <label className="form-field">
        Default quality
        <select
          value={defaultQuality}
          onChange={(event) => setDefaultQuality(event.target.value)}
        >
          <option value="fast">Fast</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </label>
      {error && <p className="form-error">{error}</p>}
      <button
        className="button button-dark"
        onClick={save}
        disabled={saving || !workspaceName.trim()}
      >
        {saving ? (
          <LoaderCircle className="spin" size={15} />
        ) : saved ? (
          <Check size={15} />
        ) : null}
        {saving ? "Saving…" : saved ? "Saved" : "Save workspace"}
      </button>
    </section>
  );
}
