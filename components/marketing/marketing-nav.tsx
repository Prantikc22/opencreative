"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, AudioLines, Bot, ChevronDown, CircleUserRound, Clapperboard, ImageIcon, Music2, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ToolIcon, type ToolIconName } from "@/components/tool-icon";
import { productConfig } from "@/lib/config";
import { creativeTools, creativeToolIcons } from "@/lib/creative-tools";

const toolCategories = (["Video", "Image", "Audio", "World", "Characters"] as const).map((category) => ({
  category,
  tools: creativeTools.filter((tool) => tool.category === category),
}));

const toolCategoryHrefs = {
  Video: "/studio/video",
  Image: "/studio/image",
  Audio: "/studio/audio",
  World: "/studio/image?tool=create-world",
  Characters: "/identities/avatars",
} as const;

const products = [
  ["Image Studio", "Campaign stills and product photography", "/studio/image", ImageIcon],
  ["Video Studio", "Shots, storyboards, and finished film", "/studio/video", Clapperboard],
  ["Voice Studio", "Speech, dubbing, and localization", "/studio/audio", AudioLines],
  ["Avatar Studio", "Presenters and digital twins", "/studio/avatar", CircleUserRound],
  ["Music", "Original tracks from a creative brief", "/studio/music", Music2],
  ["OpenCreative Agents", "Voice-first support for any device", "/studio/agents", Bot],
] as const;

const solutions = [
  ["Marketing teams", "Launch complete campaigns", "/solutions/marketing"],
  ["Ecommerce", "Move from product to performance creative", "/solutions/ecommerce"],
  ["Agencies", "Direct more client work from one brief", "/solutions/agencies"],
  ["Customer support", "Answer customers by voice or text", "/solutions/customer-support"],
  ["Creators", "Publish in every format", "/#avatars"],
  ["Localization", "Reach every market in its language", "/#voices"],
] as const;

const resources = [
  ["API documentation", "Quickstarts, examples, endpoints, errors, and billing", "/docs/api"],
  ["Developer API", "Build with image, video, voice, music, and avatar endpoints", "/developers"],
  ["Showcase", "Work made across all six products", "/#showcase"],
  ["Pricing", "Plans, comparison, and calculator", "/pricing"],
  ["Compare", "OpenCreative alongside specialist tools", "/compare"],
  ["Affiliates", "Share OpenCreative and track rewards", "/affiliates"],
  ["MCP", "Let AI agents use your creative tools", "/mcp"],
  ["Safety", "Consent, privacy, and provenance", "/#safety"],
  ["Open source", "Inspect and self-host the core", "/open-source"],
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState<"products" | "tools" | "solutions" | "resources" | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overlaysDarkHero = pathname === "/" || pathname === "/developers" || pathname === "/docs/api";

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 28);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  function toggle(menu: typeof open) {
    setOpen((current) => current === menu ? null : menu);
  }

  return (
    <header className={`site-header home-header ${!overlaysDarkHero || scrolled ? "nav-scrolled" : ""} ${open || mobile ? "menu-active" : ""}`} onMouseLeave={() => setOpen(null)}>
      <Link href="/" aria-label={`${productConfig.name} home`}><BrandMark /></Link>
      <nav aria-label="Primary navigation" className={mobile ? "mobile-open" : ""}>
        <button type="button" onClick={() => toggle("products")} aria-expanded={open === "products"}>Products <ChevronDown size={14} /></button>
        <button type="button" onClick={() => toggle("tools")} aria-expanded={open === "tools"}>Tools <ChevronDown size={14} /></button>
        <button type="button" onClick={() => toggle("solutions")} aria-expanded={open === "solutions"}>Solutions <ChevronDown size={14} /></button>
        <button type="button" onClick={() => toggle("resources")} aria-expanded={open === "resources"}>Resources <ChevronDown size={14} /></button>
        <Link href="/#showcase">Showcase</Link>
        <Link href="/pricing">Pricing</Link>
        <div className="mobile-nav-directory" onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setMobile(false);
        }}>
          <details><summary>Products <ChevronDown size={16} /></summary><div>{products.map(([name, , href]) => <Link href={href} key={name}>{name}</Link>)}</div></details>
          <details><summary>Tools <ChevronDown size={16} /></summary><div>{toolCategories.map(({ category }) => <Link href={toolCategoryHrefs[category]} key={category}>{category} tools</Link>)}<Link href="/tools">All 32 tools</Link></div></details>
          <details><summary>Solutions <ChevronDown size={16} /></summary><div>{solutions.slice(0, 4).map(([name, , href]) => <Link href={href} key={name}>{name}</Link>)}</div></details>
          <details><summary>Resources <ChevronDown size={16} /></summary><div><Link href="/docs/api">API documentation</Link><Link href="/developers">Developer API</Link><Link href="/compare">Compare</Link><Link href="/affiliates">Affiliates</Link><Link href="/mcp">MCP</Link><Link href="/open-source">Open source</Link></div></details>
          <details><summary>Company <ChevronDown size={16} /></summary><div><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer">About</a><a href="https://www.resolutexhq.com/careers" target="_blank" rel="noreferrer">Careers</a></div></details>
          <div className="mobile-nav-footer"><Link href="/login">Sign in</Link><Link className="mobile-nav-start" href="/signup">Start creating free <ArrowRight size={15} /></Link></div>
        </div>
      </nav>
      <div className="home-header-actions"><Link className="header-signin" href="/login">Sign in</Link><Link className="oc-button oc-button-coral" href="/signup">Start free <ArrowRight size={15} /></Link><button className="nav-mobile-toggle" type="button" onClick={() => setMobile((current) => !current)} aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile}><span aria-hidden="true">{mobile ? <X size={19} /> : <><i /><i /></>}</span></button></div>

      {open === "products" && <div className="mega-menu mega-menu-products"><div className="mega-kicker"><span>THE COMPLETE STUDIO</span><strong>One brief across every medium.</strong><Link href="/#platform">See all products <ArrowRight size={14} /></Link></div><div className="mega-grid">{products.map(([name, copy, href, Icon]) => <Link href={href} key={name}><Icon size={20} /><span><strong>{name}</strong><small>{copy}</small></span><ArrowRight size={14} /></Link>)}</div></div>}
      {open === "tools" && <div className="mega-menu mega-menu-tools"><div className="mega-kicker"><span>32 PURPOSE-BUILT TOOLS</span><strong>Open the exact operation you need.</strong><Link href="/tools">Explore the full toolbox <ArrowRight size={14} /></Link></div><div className="mega-tool-directory">{toolCategories.map(({ category, tools }) => <section key={category}><header><span>{category}</span><small>{tools.length}</small></header>{tools.map((tool) => <Link href={tool.href} key={tool.id}><ToolIcon name={creativeToolIcons[tool.id] as ToolIconName} size={14} />{tool.name}</Link>)}</section>)}</div></div>}
      {open === "solutions" && <div className="mega-menu"><div className="mega-kicker"><span>BUILT AROUND THE OUTCOME</span><strong>Choose the work, not the model.</strong><Link href="/#platform">Explore the platform <ArrowRight size={14} /></Link></div><div className="mega-link-grid">{solutions.map(([name, copy, href]) => <Link href={href} key={name}><strong>{name}</strong><small>{copy}</small></Link>)}</div></div>}
      {open === "resources" && <div className="mega-menu"><div className="mega-kicker"><span>LEARN AND BUILD</span><strong>From first brief to full control.</strong><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer">About ResoluteX HQ <ArrowRight size={14} /></a></div><div className="mega-link-grid">{resources.map(([name, copy, href]) => <Link href={href} key={name}><strong>{name}</strong><small>{copy}</small></Link>)}<a href="https://www.resolutexhq.com/careers" target="_blank" rel="noreferrer"><strong>Careers</strong><small>Build the next creative operating system</small></a><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer"><strong>About</strong><small>Meet the company behind OpenCreative</small></a></div></div>}
    </header>
  );
}
