import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  CircleUserRound,
  Clapperboard,
  Images,
  PackageOpen,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { CreativeCommand } from "@/components/creative-command";
import { getWorkspaceContext } from "@/lib/workspace";

const actions = [
  [
    "Create UGC",
    "Creator-led ads that feel native",
    "/create/ugc",
    CircleUserRound,
    "coral",
  ],
  [
    "Turn product into ad",
    "From product page to campaign",
    "/create/ad",
    PackageOpen,
    "sand",
  ],
  [
    "Create cinematic video",
    "Build a polished multi-shot story",
    "/studio/video",
    Clapperboard,
    "night",
  ],
  [
    "Generate product photos",
    "On-brand images in any setting",
    "/studio/image",
    Images,
    "blue",
  ],
  [
    "Create voiceover",
    "Expressive, multilingual speech",
    "/studio/audio",
    AudioLines,
    "gold",
  ],
  [
    "Create avatar",
    "A reusable on-brand creator",
    "/studio/avatar",
    WandSparkles,
    "violet",
  ],
] as const;

export default async function DashboardPage() {
  const { profile, supabase, workspaceId } = await getWorkspaceContext();
  const first = (profile?.full_name || "Creator").split(" ")[0];
  const [{ data: projects }, { data: brands }, { data: generations }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id,title,project_type,status,updated_at")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("brands")
        .select("id,name,industry,colors")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("generations")
        .select("id,capability,status,prompt,created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="dashboard-page">
      <section className="dashboard-intro">
        <p className="eyebrow">
          <Sparkles size={13} /> Creative workspace
        </p>
        <h1>
          {greeting}, {first}.<br />
          <span>What are we creating?</span>
        </h1>
        <CreativeCommand />
      </section>
      <section className="quick-actions">
        <div className="section-head">
          <h2>Start with an outcome</h2>
          <Link href="/create">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="action-grid">
          {actions.map(([title, copy, href, Icon, tone]) => (
            <Link className={`action-tile tone-${tone}`} href={href} key={href}>
              <span className="action-icon">
                <Icon size={21} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <ArrowRight className="action-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>
      <div className="dashboard-columns">
        <section>
          <div className="section-head">
            <h2>Recent projects</h2>
            <Link href="/workspace/projects">View all</Link>
          </div>
          {projects?.length ? (
            <div className="recent-list">
              {projects.map((p) => (
                <Link
                  href={`/workspace/projects/${p.id}`}
                  key={p.id}
                  className="recent-row"
                >
                  <span className="project-thumb">
                    <Clapperboard size={20} />
                  </span>
                  <span>
                    <strong>{p.title}</strong>
                    <small>
                      {p.project_type.replaceAll("_", " ")} · {p.status}
                    </small>
                  </span>
                  <time>
                    {new Date(p.updated_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyMini
              title="Your first idea starts here"
              copy="Projects keep every concept, scene and version together."
              href="/create"
            />
          )}
        </section>
        <section>
          <div className="section-head">
            <h2>Brand memory</h2>
            <Link href="/identities/brands">Manage</Link>
          </div>
          {brands?.length ? (
            <div className="brand-mini-grid">
              {brands.map((b) => (
                <Link href={`/identities/brands/${b.id}`} key={b.id}>
                  <span
                    style={{
                      background:
                        Array.isArray(b.colors) && b.colors[0]
                          ? String(b.colors[0])
                          : "#ef664f",
                    }}
                  >
                    {b.name.slice(0, 2).toUpperCase()}
                  </span>
                  <strong>{b.name}</strong>
                  <small>{b.industry || "Brand DNA"}</small>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyMini
              title="Teach us your brand"
              copy="Colors, tone and products become reusable creative memory."
              href="/identities/brands/new"
            />
          )}
        </section>
      </div>
      <section className="generation-strip">
        <div className="section-head">
          <h2>Recent generations</h2>
          <Link href="/workspace/generations">Generation history</Link>
        </div>
        {generations?.length ? (
          <div className="generation-list">
            {generations.map((g) => (
              <Link key={g.id} href={`/workspace/generations/${g.id}`}>
                <span className={`generation-status status-${g.status}`} />
                <strong>{g.prompt.slice(0, 72)}</strong>
                <small>
                  {g.capability} · {g.status}
                </small>
              </Link>
            ))}
          </div>
        ) : (
          <p className="inline-empty">
            Your generated images, video, and voice will appear here.
          </p>
        )}
      </section>
    </div>
  );
}

function EmptyMini({
  title,
  copy,
  href,
}: {
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <div className="empty-mini">
      <span>
        <Sparkles size={20} />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{copy}</p>
      </div>
      <Link href={href}>
        Create <ArrowRight size={14} />
      </Link>
    </div>
  );
}
