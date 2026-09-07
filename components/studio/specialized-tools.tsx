import Link from "next/link";
import { ArrowRight, Check, Compass } from "lucide-react";
import { creativeTools, creativeToolIcons, type CreativeToolCategory } from "@/lib/creative-tools";
import { ToolIcon, type ToolIconName } from "@/components/tool-icon";

export function SpecializedTools({ category, currentId }: { category: CreativeToolCategory; currentId?: string }) {
  const tools = creativeTools.filter((tool) => tool.category === category);
  const currentTool = tools.find((tool) => tool.id === currentId);
  return (
    <section className="specialized-tool-rail" aria-label={`${category} specialized tools`}>
      <div className="specialized-tool-rail-head">
        <span><Compass size={14} /> Explore {category.toLowerCase()} tools</span>
        <span className="specialized-tool-selection" aria-live="polite">
          {currentTool ? <><Check size={13} /> Selected: {currentTool.name}</> : "Choose a tool to configure this studio"}
        </span>
        <Link href="/tools">See all <ArrowRight size={13} /></Link>
      </div>
      <div className="specialized-tool-chips">
        {tools.map((tool) => {
          const disabled = tool.status === "Setup required";
          const selected = currentId === tool.id;
          const content = <><span className="specialized-tool-icon"><ToolIcon name={creativeToolIcons[tool.id] as ToolIconName} size={15} /></span><span>{tool.name}</span>{disabled && <small>Setup</small>}{selected && <Check className="specialized-tool-check" size={14} aria-hidden="true" />}</>;
          return disabled ? <span className="specialized-tool-chip disabled" key={tool.id}>{content}</span> : <Link aria-current={selected ? "page" : undefined} className={`specialized-tool-chip${selected ? " active" : ""}`} href={tool.href} key={tool.id}>{content}</Link>;
        })}
      </div>
    </section>
  );
}
