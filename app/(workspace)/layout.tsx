import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { getWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getWorkspaceContext();
  if (
    !context.profile?.onboarding_completed &&
    !String(context.user.user_metadata?.onboarding_skipped || "")
  )
    redirect("/onboarding");
  const name =
    context.profile?.full_name ||
    context.user.email?.split("@")[0] ||
    "Creator";
  return (
    <div className="app-shell">
      <AppSidebar
        workspaceName={context.workspace?.name || "My studio"}
        plan={context.workspace?.plan || "free"}
      />
      <div className="app-main">
        <AppTopbar
          credits={context.wallet?.balance || 0}
          name={name}
          email={context.user.email || ""}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
