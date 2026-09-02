import type { Metadata } from "next";
import { Code2, KeyRound, LogOut, Settings, ShieldCheck } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import Link from "next/link";
import {
  ProfileSettings,
  WorkspaceSettings,
} from "@/components/settings-forms";
export const metadata: Metadata = { title: "Settings" };
export default async function Page() {
  const { user, profile, workspace } = await getWorkspaceContext();
  return (
    <div className="settings-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <Settings size={13} />
            Settings
          </p>
          <h1>Your studio, your rules.</h1>
          <p>
            Manage profile, workspace defaults, privacy and self-hosted
            configuration.
          </p>
        </div>
      </header>
      <div className="settings-grid">
        <ProfileSettings
          name={profile?.full_name || ""}
          email={user.email || ""}
        />
        <WorkspaceSettings
          name={workspace?.name || ""}
          quality={String(
            (workspace?.settings as { defaultQuality?: string })
              ?.defaultQuality || "standard",
          )}
        />
        <section>
          <h2>
            <ShieldCheck size={17} />
            Security & rights
          </h2>
          <p>
            Private media uses short-lived R2 links. Service, model and storage
            secrets remain server-only.
          </p>
          <Link href="/update-password">
            <KeyRound size={15} />
            Change password
          </Link>
          <form action="/auth/signout" method="post">
            <button className="danger">
              <LogOut size={15} />
              Sign out
            </button>
          </form>
        </section>
        <section>
          <h2>
            <Code2 size={17} />
            Developer / BYOK
          </h2>
          <p>
            Self-host the same core product with your own OpenRouter, Supabase
            and R2 credentials.
          </p>
          <dl>
            <div>
              <dt>Operating mode</dt>
              <dd>{process.env.OPENCREATIVE_MODE || "self-hosted"}</dd>
            </div>
            <div>
              <dt>OpenRouter</dt>
              <dd>Configured server-side</dd>
            </div>
            <div>
              <dt>Media storage</dt>
              <dd>Private Cloudflare R2</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
