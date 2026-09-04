import type { Metadata } from "next";
import { EmbeddedAgentChat } from "@/components/embedded-agent-chat";

export const metadata: Metadata = { title: "Customer support", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmbeddedAgentChat agentId={id} />;
}
