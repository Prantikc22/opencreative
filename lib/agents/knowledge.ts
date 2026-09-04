export type AgentResource = {
  id: string;
  name: string;
  type: "website" | "pdf";
  source: string;
  text: string;
};

export function agentKnowledge(
  knowledgeText: string,
  settings: unknown,
) {
  const resources = readAgentResources(settings);
  if (!resources.length) return knowledgeText;
  return [
    knowledgeText,
    ...resources.map((resource) =>
      `Resource: ${resource.name}\nSource: ${resource.source}\n${resource.text}`,
    ),
  ].join("\n\n---\n\n");
}

export function readAgentResources(settings: unknown): AgentResource[] {
  if (!settings || typeof settings !== "object") return [];
  const resources = (settings as { resources?: unknown }).resources;
  if (!Array.isArray(resources)) return [];
  return resources.filter((resource): resource is AgentResource => {
    if (!resource || typeof resource !== "object") return false;
    const value = resource as Partial<AgentResource>;
    return Boolean(
      value.id && value.name && value.source && value.text &&
      (value.type === "website" || value.type === "pdf"),
    );
  });
}
