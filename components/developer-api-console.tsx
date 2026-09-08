"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const examples = {
  image: {
    label: "Image",
    code: `curl https://www.opencreativehq.com/api/v1/images \\
  -H "Authorization: Bearer $OPENCREATIVE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Editorial product photograph of a coral glass bottle",
    "aspectRatio": "1:1",
    "quality": "standard"
  }'`,
  },
  video: {
    label: "Video",
    code: `const response = await fetch("https://www.opencreativehq.com/api/v1/videos", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.OPENCREATIVE_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Slow cinematic push-in, warm reflections and soft haze",
    duration: 5,
    aspectRatio: "16:9",
    quality: "standard",
  }),
});

const generation = await response.json();`,
  },
  speech: {
    label: "Speech",
    code: `import os, requests

response = requests.post(
    "https://www.opencreativehq.com/api/v1/speech",
    headers={"Authorization": f"Bearer {os.environ['OPENCREATIVE_API_KEY']}"},
    json={
        "text": "One idea. Every way it can move.",
        "voice": "alloy",
        "quality": "standard"
    },
)
response.raise_for_status()
print(response.json())`,
  },
} as const;

export function DeveloperApiConsole() {
  const [selected, setSelected] = useState<keyof typeof examples>("image");
  const [copied, setCopied] = useState(false);
  const example = examples[selected];
  async function copy() {
    await navigator.clipboard.writeText(example.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="developer-console">
      <header>
        <div role="tablist" aria-label="API examples">
          {Object.entries(examples).map(([id, item]) => (
            <button type="button" role="tab" aria-selected={selected === id} className={selected === id ? "active" : ""} onClick={() => setSelected(id as keyof typeof examples)} key={id}>{item.label}</button>
          ))}
        </div>
        <button type="button" className="developer-copy" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
      </header>
      <pre><code>{example.code}</code></pre>
      <footer><span>Server-side keys</span><span>Versioned API</span><span>Idempotent requests</span></footer>
    </div>
  );
}
