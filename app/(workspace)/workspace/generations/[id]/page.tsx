import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock3,
  Coins,
  Cpu,
  Download,
  Sparkles,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { createDownloadUrl } from "@/lib/storage/r2";
export const metadata: Metadata = { title: "Generation" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data: g } = await supabase
    .from("generations")
    .select("*,projects(id,title)")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();
  if (!g) notFound();
  const { data: links } = await supabase
    .from("generation_assets")
    .select("assets(id,r2_key,kind,file_name,mime_type)")
    .eq("generation_id", id);
  const assets = [];
  for (const link of links || []) {
    const a = Array.isArray(link.assets) ? link.assets[0] : link.assets;
    if (a) assets.push({ ...a, url: await createDownloadUrl(a.r2_key) });
  }
  const project = Array.isArray(g.projects) ? g.projects[0] : g.projects;
  return (
    <div className="generation-detail-page">
      <header>
        <Link href="/workspace/generations">
          <ArrowLeft size={15} />
          Generation history
        </Link>
        <span className={`table-status status-${g.status}`}>
          <i />
          {g.status}
        </span>
      </header>
      <div className="generation-detail-grid">
        <section className="generation-output">
          {assets.length ? (
            assets.map((a, index) => (
              <figure key={a.id}>
                {a.kind === "image" ? (
                  <Image src={a.url} alt={a.file_name} fill sizes="60vw" />
                ) : a.kind === "video" ? (
                  <video src={a.url} controls playsInline />
                ) : (
                  <audio src={a.url} controls />
                )}
                <figcaption>
                  <span>Output {index + 1}</span>
                  <a href={a.url} download>
                    <Download size={15} />
                    Download
                  </a>
                </figcaption>
              </figure>
            ))
          ) : (
            <div className="canvas-empty">
              <span>
                <Sparkles size={28} />
              </span>
              <h2>
                {["queued", "generating", "processing"].includes(g.status)
                  ? "This creative is still being made"
                  : "No output was saved"}
              </h2>
              <p>
                {g.error_message ||
                  "Refresh to check the latest provider state."}
              </p>
            </div>
          )}
        </section>
        <aside>
          <p className="eyebrow">Generation details</p>
          <h1>{g.capability} generation</h1>
          <dl>
            <div>
              <dt>Project</dt>
              <dd>
                {project ? (
                  <Link href={`/workspace/projects/${project.id}`}>
                    {project.title}
                  </Link>
                ) : (
                  "Unassigned"
                )}
              </dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>
                <Cpu size={13} />
                {g.model_id}
              </dd>
            </div>
            <div>
              <dt>Credits</dt>
              <dd>
                <Coins size={13} />
                {g.credit_cost}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>
                <Clock3 size={13} />
                {new Date(g.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
          <label>Prompt</label>
          <p className="generation-prompt">{g.prompt}</p>
          <label>Settings</label>
          <pre>{JSON.stringify(g.parameters, null, 2)}</pre>
          {g.error_message && <p className="form-error">{g.error_message}</p>}
          <Link
            className="button button-dark"
            href={`/studio/${g.capability === "avatar" ? "avatar" : g.capability === "video" ? "video" : g.capability === "image" ? "image" : "audio"}?prompt=${encodeURIComponent(g.prompt)}${project ? `&projectId=${project.id}` : ""}`}
          >
            <Sparkles size={15} />
            Create a variation
          </Link>
        </aside>
      </div>
    </div>
  );
}
