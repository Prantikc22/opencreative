"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Endpoint = {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  fields: Array<[string, string, string]>;
  request?: string;
  response: string;
};

const endpoints: Endpoint[] = [
  {
    id: "images", name: "Create images", method: "POST", path: "/api/v1/images",
    summary: "Generate a new image or run a specialist image operation. Completed assets include signed download URLs.",
    fields: [["prompt", "string · required", "Creative direction, 3–8,000 characters."], ["aspectRatio", "enum", "1:1, 16:9, 9:16, 4:3, or 3:4."], ["quality", "enum", "fast, standard, premium, or advanced."], ["count", "integer", "1–4 outputs."], ["operation", "string", "For example create-image, edit-image, or remove-background."], ["references", "URL[]", "Up to five reference images."], ["idempotencyKey", "UUID", "Prevents duplicate generations on retries."]],
    request: `{
  "prompt": "Editorial product photo of a coral glass bottle",
  "aspectRatio": "1:1",
  "quality": "standard",
  "count": 1,
  "idempotencyKey": "0ab8f98c-5bfc-42a9-92a4-d7e519f89b41"
}`,
    response: `{
  "generationId": "5a3e…",
  "status": "completed",
  "model": { "id": "…", "displayName": "…" },
  "assets": [{ "id": "…", "mime_type": "image/webp", "url": "https://…" }]
}`,
  },
  {
    id: "videos", name: "Create video", method: "POST", path: "/api/v1/videos",
    summary: "Queue a video generation or transformation. Poll the returned generation ID until it completes.",
    fields: [["prompt", "string · required", "Creative direction, 3–8,000 characters."], ["aspectRatio", "enum", "16:9, 9:16, or 1:1."], ["duration", "integer", "3–10 seconds; supported values depend on the routed model."], ["resolution", "enum", "480p, 720p, or 1080p."], ["generateAudio", "boolean", "Request native audio where the model supports it."], ["firstFrame", "URL", "Starting frame for frame-to-video."], ["sourceVideo", "URL", "Required by video editing operations."], ["references", "URL[]", "Up to five visual references."], ["idempotencyKey", "UUID", "Recommended for every create call."]],
    request: `{
  "prompt": "Slow cinematic push-in, warm reflections, soft haze",
  "duration": 5,
  "aspectRatio": "16:9",
  "resolution": "720p",
  "quality": "standard",
  "idempotencyKey": "77fb8db3-2b1f-46de-928b-1189a588e3b2"
}`,
    response: `{
  "generationId": "824f…",
  "status": "queued",
  "estimatedCredits": 24,
  "model": { "id": "…", "displayName": "…" }
}`,
  },
  {
    id: "speech", name: "Generate speech", method: "POST", path: "/api/v1/speech",
    summary: "Synthesize speech and receive a signed audio URL in the response.",
    fields: [["text", "string · required", "Up to 10,000 characters."], ["voice", "string", "Voice identifier; defaults to alloy."], ["speed", "number", "0.7–1.3; defaults to 1."], ["quality", "enum", "fast, standard, or premium."], ["idempotencyKey", "UUID", "Prevents duplicate audio on retries."]],
    request: `{
  "text": "One idea. Every way it can move.",
  "voice": "alloy",
  "speed": 1,
  "quality": "standard"
}`,
    response: `{
  "generationId": "a51c…",
  "status": "completed",
  "assetId": "841d…",
  "url": "https://…",
  "model": { "id": "…", "displayName": "…" }
}`,
  },
  {
    id: "music", name: "Generate music", method: "POST", path: "/api/v1/music",
    summary: "Create an original commercial-ready track from a creative brief.",
    fields: [["prompt", "string · required", "Music brief, 10–3,000 characters."], ["mood", "string", "Creative mood; defaults to Cinematic."], ["instrumental", "boolean", "Defaults to true."], ["quality", "enum", "standard or premium."], ["idempotencyKey", "UUID", "Prevents duplicate tracks on retries."]],
    request: `{
  "prompt": "A restrained electronic pulse for a product reveal",
  "mood": "Cinematic",
  "instrumental": true,
  "quality": "standard"
}`,
    response: `{
  "generationId": "92b7…",
  "status": "completed",
  "assetId": "64a0…",
  "url": "https://…",
  "credits": 12
}`,
  },
  {
    id: "avatars", name: "Create avatar video", method: "POST", path: "/api/v1/avatars",
    summary: "Queue a consented talking-presenter video. Poll the generation endpoint for the final asset.",
    fields: [["script", "string · required", "Spoken script, 3–5,000 characters."], ["referenceImage", "URL · required", "Consented presenter image."], ["consent", "true · required", "Confirms authorization to use the identity."], ["voiceAudio", "URL", "Optional voice reference."], ["aspectRatio", "enum", "16:9, 9:16, or 1:1."], ["duration", "integer", "5–30 seconds."], ["idempotencyKey", "UUID", "Recommended for every create call."]],
    request: `{
  "script": "Welcome to the next chapter of our product.",
  "referenceImage": "https://cdn.example.com/presenter.jpg",
  "consent": true,
  "aspectRatio": "9:16",
  "duration": 10
}`,
    response: `{
  "generationId": "41de…",
  "status": "queued",
  "estimatedCredits": 36,
  "model": { "id": "…", "displayName": "…" }
}`,
  },
  {
    id: "transcriptions", name: "Transcribe media", method: "POST", path: "/api/v1/transcriptions",
    summary: "Transcribe base64-encoded audio or video into text and timestamped segments.",
    fields: [["base64", "string · required", "Base64 media bytes, without a data-URL prefix."], ["format", "enum · required", "wav, mp3, flac, m4a, ogg, webm, aac, mp4, or mov."], ["language", "string", "Optional two-letter language code."], ["durationSeconds", "number", "Optional duration estimate, up to 3,600 seconds."], ["quality", "enum", "standard or premium."], ["idempotencyKey", "UUID", "Prevents duplicate transcription charges."]],
    request: `{
  "base64": "<base64 media bytes>",
  "format": "mp3",
  "language": "en",
  "quality": "standard"
}`,
    response: `{
  "generationId": "73f9…",
  "status": "completed",
  "transcript": "Your transcript…",
  "language": "en",
  "segments": []
}`,
  },
  {
    id: "generation", name: "Check generation", method: "GET", path: "/api/v1/generations/{id}",
    summary: "Fetch current status and signed output URLs for an asynchronous video or avatar render.",
    fields: [["id", "UUID · path", "The generationId returned by a create call."]],
    response: `{
  "generation": { "id": "824f…", "status": "completed", "capability": "video" },
  "assets": [{ "kind": "video", "mime_type": "video/mp4", "url": "https://…" }]
}`,
  },
  {
    id: "models", name: "List models", method: "GET", path: "/api/v1/models?capability=video",
    summary: "Read the curated live model catalog for image, video, speech, or transcription.",
    fields: [["capability", "query enum", "image, video, speech, or transcription; defaults to image."]],
    response: `{
  "models": [{ "id": "…", "displayName": "…", "quality": "standard" }]
}`,
  },
  {
    id: "credits", name: "Check credits", method: "GET", path: "/api/v1/credits",
    summary: "Read the current workspace credit balance used by both the API and studio.",
    fields: [], response: `{ "balance": 486 }`,
  },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <button type="button" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>;
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return <div className="api-docs-code"><header><span>{title}</span><CopyButton value={code} /></header><pre><code>{code}</code></pre></div>;
}

export function ApiReference() {
  const quickstart = `curl https://www.opencreativehq.com/api/v1/images \\
  -H "Authorization: Bearer $OPENCREATIVE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Editorial product photograph in warm morning light"}'`;
  return (
    <div className="api-docs-layout">
      <aside className="api-docs-sidebar">
        <span>GET STARTED</span>
        <a href="#quickstart">Quickstart</a><a href="#authentication">Authentication</a><a href="#billing">Credits &amp; billing</a>
        <span>CREATE</span>
        {endpoints.slice(0, 6).map((endpoint) => <a href={`#${endpoint.id}`} key={endpoint.id}>{endpoint.name}</a>)}
        <span>READ</span>
        {endpoints.slice(6).map((endpoint) => <a href={`#${endpoint.id}`} key={endpoint.id}>{endpoint.name}</a>)}
        <span>REFERENCE</span>
        <a href="#errors">Errors</a><a href="#idempotency">Idempotency</a><a href="/api/v1/openapi.json">OpenAPI JSON ↗</a>
      </aside>
      <div className="api-docs-content">
        <section id="quickstart" className="api-docs-intro">
          <p className="section-kicker">QUICKSTART</p><h2>Your first output<br /><em>in one request.</em></h2>
          <ol><li><b>1</b><span><strong>Create a key</strong>Open Developer API &amp; MCP in your dashboard. The secret is shown once.</span></li><li><b>2</b><span><strong>Keep it server-side</strong>Set it as <code>OPENCREATIVE_API_KEY</code>. Never expose it in browser code.</span></li><li><b>3</b><span><strong>Make a request</strong>All endpoints share one Bearer token and workspace credit wallet.</span></li></ol>
          <CodeBlock title="cURL" code={quickstart} />
        </section>
        <section id="authentication" className="api-docs-guide">
          <div><p className="section-kicker">AUTHENTICATION</p><h2>Bearer keys,<br /><em>scoped to a workspace.</em></h2></div>
          <div><p>Send your key in the <code>Authorization</code> header on every request. Keys begin with <code>oc_live_</code>, are stored as one-way hashes, and can be revoked from the dashboard.</p><CodeBlock title="HTTP header" code="Authorization: Bearer oc_live_your_key" /></div>
        </section>
        <section id="billing" className="api-docs-guide api-docs-billing-guide">
          <div><p className="section-kicker">CREDITS &amp; BILLING</p><h2>One wallet.<br /><em>Pay as you go.</em></h2></div>
          <div><p>API calls use the same credits as the OpenCreative studio. Add one-time Dodo Payments top-ups or use recurring plan credits. A generation reserves its estimated cost before provider work begins; failed jobs return that reservation.</p><p>Check your balance with <code>GET /api/v1/credits</code>. If it is too low, the API returns <code>402</code> before generation starts.</p></div>
        </section>
        <section className="api-docs-endpoint-list" aria-label="API endpoints">
          {endpoints.map((endpoint) => (
            <article id={endpoint.id} key={endpoint.id}>
              <header><span className={`api-method ${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><code>{endpoint.path}</code></header>
              <h2>{endpoint.name}</h2><p>{endpoint.summary}</p>
              {endpoint.fields.length > 0 && <div className="api-field-table"><h3>Parameters</h3>{endpoint.fields.map(([name, type, description]) => <div key={name}><code>{name}</code><span>{type}</span><p>{description}</p></div>)}</div>}
              <div className="api-example-grid">{endpoint.request && <CodeBlock title="Request body" code={endpoint.request} />}<CodeBlock title="Response" code={endpoint.response} /></div>
            </article>
          ))}
        </section>
        <section id="errors" className="api-docs-guide api-docs-errors">
          <div><p className="section-kicker">ERRORS</p><h2>Useful status codes.</h2></div>
          <div className="api-error-list"><p><code>400</code><span>Invalid request or unsupported parameters.</span></p><p><code>401</code><span>Missing, malformed, revoked, or expired credential.</span></p><p><code>402</code><span>Workspace does not have enough credits.</span></p><p><code>403</code><span>Creative API access is not enabled.</span></p><p><code>429</code><span>Provider capacity or rate limit reached.</span></p><p><code>500</code><span>Generation failed; reserved credits are returned.</span></p></div>
        </section>
        <section id="idempotency" className="api-docs-guide">
          <div><p className="section-kicker">SAFE RETRIES</p><h2>Idempotency.</h2></div><div><p>Include a fresh UUID in <code>idempotencyKey</code> for every logical create operation. Reusing that UUID returns the original generation instead of charging for a duplicate when your network retries.</p></div>
        </section>
      </div>
    </div>
  );
}
