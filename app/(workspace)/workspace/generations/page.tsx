import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Coins, Cpu, Sparkles } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
export const metadata: Metadata = { title: "Generations" };
export default async function Page() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase
    .from("generations")
    .select(
      "id,capability,status,prompt,model_id,credit_cost,created_at,projects(title)",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <div className="library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <Sparkles size={13} />
            Generations
          </p>
          <h1>Every version. Nothing lost.</h1>
          <p>
            Follow live jobs, revisit an earlier result, or understand exactly
            where your credits went.
          </p>
        </div>
      </header>
      <div className="generation-table">
        <header>
          <span>Generation</span>
          <span>Project</span>
          <span>Model</span>
          <span>Credits</span>
          <span>Status</span>
          <span />
        </header>
        {data?.map((g) => {
          const project = Array.isArray(g.projects)
            ? g.projects[0]
            : g.projects;
          return (
            <Link href={`/workspace/generations/${g.id}`} key={g.id}>
              <span>
                <i>
                  <Sparkles size={16} />
                </i>
                <strong>{g.prompt.slice(0, 72)}</strong>
                <small>
                  {g.capability} · {new Date(g.created_at).toLocaleString()}
                </small>
              </span>
              <span>{project?.title || "Unassigned"}</span>
              <span>
                <Cpu size={13} />
                {g.model_id.split("/").pop()}
              </span>
              <span>
                <Coins size={13} />
                {g.credit_cost}
              </span>
              <span className={`table-status status-${g.status}`}>
                <i />
                {g.status}
              </span>
              <ArrowRight size={15} />
            </Link>
          );
        })}
      </div>
      {!data?.length && (
        <div className="library-empty">
          <span>
            <Clock3 size={28} />
          </span>
          <h2>No generations yet</h2>
          <p>Every image, video, voice and transcript will be logged here.</p>
        </div>
      )}
    </div>
  );
}
