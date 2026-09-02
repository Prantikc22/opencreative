import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clapperboard,
  Coins,
  History,
  ImageIcon,
  Layers3,
  Play,
  Sparkles,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { ProjectActions } from "@/components/library/project-actions";
export const metadata: Metadata = { title: "Project" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data: project } = await supabase
    .from("projects")
    .select("*,brands(name),products(name),avatars(name)")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();
  if (!project) notFound();
  const [{ data: scenes }, { data: generations }, { data: assets }] =
    await Promise.all([
      supabase
        .from("project_scenes")
        .select("*")
        .eq("project_id", id)
        .order("position"),
      supabase
        .from("generations")
        .select("id,capability,status,prompt,model_id,credit_cost,created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("assets")
        .select("id,kind,file_name,created_at")
        .eq("project_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);
  return (
    <div className="project-detail-page">
      <header>
        <Link href="/workspace/projects">
          <ArrowLeft size={15} />
          Projects
        </Link>
        <ProjectActions id={id} />
      </header>
      <section className="project-title">
        <div>
          <p className="eyebrow">
            <Clapperboard size={13} />
            {project.project_type.replaceAll("_", " ")}
          </p>
          <h1>{project.title}</h1>
          <p>{project.prompt || "No creative brief saved."}</p>
        </div>
        <span className={`project-state status-${project.status}`}>
          {project.status}
        </span>
      </section>
      <div className="project-tabs">
        <a className="active" href="#storyboard">
          <Layers3 size={15} />
          Storyboard
        </a>
        <Link href="/workspace/assets">
          <ImageIcon size={15} />
          Assets <span>{assets?.length || 0}</span>
        </Link>
        <a href="#history">
          <History size={15} />
          History <span>{generations?.length || 0}</span>
        </a>
      </div>
      <section className="project-storyboard" id="storyboard">
        <div className="section-head">
          <div>
            <h2>Storyboard</h2>
            <p>Each scene stays independently editable and regeneratable.</p>
          </div>
          <Link
            className="button button-dark"
            href={`/studio/video?projectId=${id}&prompt=${encodeURIComponent(project.prompt || project.title)}`}
          >
            <Play size={15} />
            Generate next scene
          </Link>
        </div>
        {scenes?.length ? (
          <div className="project-scene-list">
            {scenes.map((scene, index) => (
              <article key={scene.id}>
                <div className="scene-number">
                  {String(index + 1).padStart(2, "0")}
                  <span>{scene.duration_seconds || 0}s</span>
                </div>
                <div className="scene-visual">
                  <Clapperboard size={26} />
                  <em className={`status-${scene.status}`}>{scene.status}</em>
                </div>
                <div>
                  <span>
                    {String(
                      (scene.metadata as { shotType?: string })?.shotType ||
                        "shot",
                    )}
                  </span>
                  <h3>{scene.title}</h3>
                  <p>{scene.description}</p>
                  <small>{scene.voiceover && `VO: “${scene.voiceover}”`}</small>
                </div>
                <Link
                  href={`/studio/video?projectId=${id}&prompt=${encodeURIComponent(scene.description || scene.title)}`}
                >
                  <Sparkles size={15} />
                  Generate
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            No storyboard yet. Create a campaign plan to add structured scenes.
          </div>
        )}
      </section>
      <aside className="project-usage" id="history">
        <h2>Generation history</h2>
        {generations?.length ? (
          generations.slice(0, 8).map((g) => (
            <Link href={`/workspace/generations/${g.id}`} key={g.id}>
              <span className={`generation-status status-${g.status}`} />
              <div>
                <strong>{g.prompt.slice(0, 80)}</strong>
                <small>
                  {g.model_id} · {new Date(g.created_at).toLocaleString()}
                </small>
              </div>
              <span>
                <Coins size={12} />
                {g.credit_cost}
              </span>
            </Link>
          ))
        ) : (
          <p>No generations yet.</p>
        )}
      </aside>
    </div>
  );
}
