import type { Metadata } from "next";
import { AssetLibrary } from "@/components/library/asset-library";
import { AssetUploader } from "@/components/library/asset-uploader";
import { getWorkspaceContext } from "@/lib/workspace";
import { createDownloadUrl } from "@/lib/storage/r2";
import { GalleryHorizontalEnd } from "lucide-react";
export const metadata: Metadata = { title: "Assets" };
export default async function Page() {
  const { supabase, workspaceId } = await getWorkspaceContext();
  const { data } = await supabase
    .from("assets")
    .select("id,file_name,kind,mime_type,r2_key,created_at,is_favorite,source")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  const assets = [];
  for (const item of data || [])
    assets.push({ ...item, url: await createDownloadUrl(item.r2_key) });
  return (
    <div className="library-page">
      <header className="library-head">
        <div>
          <p className="eyebrow">
            <GalleryHorizontalEnd size={13} />
            Assets
          </p>
          <h1>Your creative library.</h1>
          <p>
            Every image, clip, voiceover, reference and export—searchable in one
            place.
          </p>
        </div>
        <AssetUploader />
      </header>
      <AssetLibrary assets={assets} />
    </div>
  );
}
