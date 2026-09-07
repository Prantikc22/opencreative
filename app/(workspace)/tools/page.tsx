import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, Sparkles } from "lucide-react";
import { creativeTools, type CreativeToolCategory } from "@/lib/creative-tools";

export const metadata: Metadata = { title: "Creative tools" };

const categories: CreativeToolCategory[] = ["Video", "Image", "Audio", "World", "Characters"];

export default function ToolsPage() {
  return (
    <div className="toolbox-page">
      <header className="library-head">
        <div>
          <p className="eyebrow"><Boxes size={14} /> Creative toolbox</p>
          <h1>Every production tool.<br />One workspace.</h1>
          <p>Choose the operation you need. OpenCreative preconfigures the right studio, model family and generation direction while keeping your references, projects and credits together.</p>
        </div>
      </header>
      {categories.map((category) => {
        const tools = creativeTools.filter((tool) => tool.category === category);
        return (
          <section className="toolbox-category" key={category}>
            <div className="section-head"><h2>{category}</h2><span>{tools.length} tools</span></div>
            <div className="toolbox-grid">
              {tools.map((tool) => (
                <Link href={tool.href} key={tool.id}>
                  <span><Sparkles size={17} /></span>
                  <div><h3>{tool.name}</h3><p>{tool.description}</p></div>
                  <small className={tool.status === "Beta" ? "beta" : ""}>{tool.status}</small>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
