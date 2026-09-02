import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { AssetLibrary } from "@/components/library/asset-library";
import { getWorkspaceContext } from "@/lib/workspace";
import { createDownloadUrl } from "@/lib/storage/r2";
export const metadata: Metadata = { title: "Favorites" };
export default async function Page() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase
    .from("assets")
    .select("id,file_name,kind,mime_type,r2_key,created_at,is_favorite,source")
    .eq("workspace_id", workspaceId)
    .eq("is_favorite", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  const assets = [];
  for (const item of data || [])
    assets.push({ ...item, url: await createDownloadUrl(item.r2_key) });
  return (
    <div className="library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <Heart size={13} />
            Favorites
          </p>
          <h1>The work worth keeping close.</h1>
          <p>
            Favorite assets and creative references from across your workspace.
          </p>
        </div>
      </header>
      <AssetLibrary assets={assets} />
    </div>
  );
}
