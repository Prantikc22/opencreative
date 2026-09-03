"use client";

import { useActionState } from "react";
import { Check, Copy, KeyRound, LoaderCircle } from "lucide-react";
import { createMcpKeyAction, type McpKeyState } from "@/app/(workspace)/account/mcp/actions";

export function McpKeyManager() {
  const [state, action, pending] = useActionState<McpKeyState, FormData>(createMcpKeyAction, {});
  return (
    <section className="mcp-key-create">
      <h2><KeyRound size={18} /> Create a cloud MCP key</h2>
      <p>This key is linked to your signed-in OpenCreative workspace, plan, credit wallet, and tenant permissions. It is shown once.</p>
      <form action={action}>
        <input name="name" minLength={2} maxLength={80} placeholder="Claude Desktop, Codex, campaign agent…" required />
        <button type="submit" disabled={pending}>{pending ? <LoaderCircle className="spin" size={16} /> : <KeyRound size={16} />} Create key</button>
      </form>
      {state.error && <p className="form-error">{state.error}</p>}
      {state.token && (
        <div className="mcp-key-secret">
          <span><Check size={15} /> Copy this key now</span>
          <code>{state.token}</code>
          <button type="button" onClick={() => navigator.clipboard.writeText(state.token || "")}><Copy size={15} /> Copy key</button>
        </div>
      )}
    </section>
  );
}
