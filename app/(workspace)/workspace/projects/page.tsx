import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  FolderOpen,
  Plus,
  Sparkles,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
export const metadata: Metadata = { title: "Projects" };
export default async function Page() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data: projects } = await supabase
    .from("projects")
    .select("id,title,project_type,status,updated_at,brands(name)")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (
    <div className="library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <FolderOpen size={13} />
            Projects
          </p>
          <h1>Every idea, still editable.</h1>
          <p>
            Concepts, scenes, media, versions and exports stay connected from
            first prompt to final cut.
          </p>
        </div>
        <Link className="button button-dark" href="/create">
          <Plus size={16} />
          New project
        </Link>
      </header>
      {projects?.length ? (
        <div className="project-grid">
          {projects.map((project, index) => {
            const brand = Array.isArray(project.brands)
              ? project.brands[0]
              : project.brands;
            return (
              <Link href={`/workspace/projects/${project.id}`} key={project.id}>
                <div className={`project-art project-art-${index % 5}`}>
                  <Clapperboard size={30} />
                  <span>{project.project_type.replaceAll("_", " ")}</span>
                </div>
                <div className="project-card-copy">
                  <span>
                    <strong>{project.title}</strong>
                    <small>
                      {brand?.name || "No brand"} · {project.status}
                    </small>
                  </span>
                  <time>
                    {new Date(project.updated_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric" },
                    )}
                  </time>
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="library-empty">
          <span>
            <Sparkles size={28} />
          </span>
          <h2>Your first project is one idea away</h2>
          <p>
            Start with a finished outcome. We&apos;ll create the project
            structure for you.
          </p>
          <Link className="button button-coral" href="/create">
            Start creating <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
