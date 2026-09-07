import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { creativeTools, creativeToolIcons, type CreativeToolCategory } from "@/lib/creative-tools";
import { ToolIcon, type ToolIconName } from "@/components/tool-icon";

export function SpecializedTools({ category, currentId }: { category: CreativeToolCategory; currentId?: string }) {
  const tools = creativeTools.filter((tool) => tool.category === category);
  return (
    <section className="specialized-tool-rail" aria-label={`${category} specialized tools`}>
      <div className="specialized-tool-rail-head">
        <span><Compass size={14} /> Explore {category.toLowerCase()} tools</span>
        <Link href="/tools">See all <ArrowRight size={13} /></Link>
      </div>
      <div className="specialized-tool-chips">
        {tools.map((tool) => {
          const disabled = tool.status === "Setup required";
          const content = <><span className="specialized-tool-icon"><ToolIcon name={creativeToolIcons[tool.id] as ToolIconName} size={15} /></span><span>{tool.name}</span>{disabled && <small>Setup</small>}</>;
          return disabled ? <span className="specialized-tool-chip disabled" key={tool.id}>{content}</span> : <Link className={`specialized-tool-chip${currentId === tool.id ? " active" : ""}`} href={tool.href} key={tool.id}>{content}</Link>;
        })}
      </div>
    </section>
  );
}
