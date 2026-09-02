"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function AssetUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const response = await fetch("/api/storage/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload",
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          category: "uploads",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Upload could not start.");
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok)
        throw new Error("The media upload did not complete.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="asset-uploader">
      <button
        className="button button-dark"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <LoaderCircle className="spin" size={16} />
        ) : (
          <Upload size={16} />
        )}
        {uploading ? "Uploading…" : "Upload assets"}
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm,audio/aac,application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {error && <small className="form-error">{error}</small>}
    </div>
  );
}
