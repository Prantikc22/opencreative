"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
export function ProjectActions({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (
      !confirm(
        "Permanently delete this project and all of its stored media? This cannot be undone.",
      )
    )
      return;
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/workspace/projects");
      router.refresh();
    }
  }
  return (
    <div className="project-actions">
      <button className="danger" onClick={remove} aria-label="Delete project">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
