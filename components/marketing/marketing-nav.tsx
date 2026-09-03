"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Bot, ChevronDown, CircleUserRound, Clapperboard, ImageIcon, Menu, Music2, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { productConfig } from "@/lib/config";

const products = [
  ["Image Studio", "Campaign stills and product photography", "/studio/image", ImageIcon],
  ["Video Studio", "Shots, storyboards, and finished film", "/studio/video", Clapperboard],
  ["Voice Studio", "Speech, dubbing, and localization", "/studio/audio", AudioLines],
  ["Avatar Studio", "Presenters and digital twins", "/studio/avatar", CircleUserRound],
  ["Music AI", "Original tracks from a creative brief", "/studio/music", Music2],
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
  ["Showcase", "Work made across all six products", "/#showcase"],
  ["Pricing", "Plans, comparison, and calculator", "/pricing"],
  ["Safety", "Consent, privacy, and provenance", "/#safety"],
  ["Open source", "Inspect and self-host the core", "/open-source"],
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState<"products" | "solutions" | "resources" | null>(null);
  const [mobile, setMobile] = useState(false);

  function toggle(menu: typeof open) {
    setOpen((current) => current === menu ? null : menu);
  }

  return (
    <header className={`site-header home-header ${open || mobile ? "menu-active" : ""}`} onMouseLeave={() => setOpen(null)}>
      <Link href="/" aria-label={`${productConfig.name} home`}><BrandMark /></Link>
      <nav aria-label="Primary navigation" className={mobile ? "mobile-open" : ""}>
        <button type="button" onClick={() => toggle("products")} aria-expanded={open === "products"}>Products <ChevronDown size={14} /></button>
        <button type="button" onClick={() => toggle("solutions")} aria-expanded={open === "solutions"}>Solutions <ChevronDown size={14} /></button>
        <button type="button" onClick={() => toggle("resources")} aria-expanded={open === "resources"}>Resources <ChevronDown size={14} /></button>
        <Link href="/#showcase">Showcase</Link>
        <Link href="/pricing">Pricing</Link>
        <div className="mobile-nav-directory">
          <span>Products</span>{products.map(([name, , href]) => <Link href={href} key={name}>{name}</Link>)}
          <span>Solutions</span>{solutions.slice(0, 4).map(([name, , href]) => <Link href={href} key={name}>{name}</Link>)}
          <span>Company</span><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer">About</a><a href="https://www.resolutexhq.com/careers" target="_blank" rel="noreferrer">Careers</a>
        </div>
      </nav>
      <div className="home-header-actions"><Link className="header-signin" href="/login">Sign in</Link><Link className="oc-button oc-button-coral" href="/signup">Start free <ArrowRight size={15} /></Link><button className="nav-mobile-toggle" type="button" onClick={() => setMobile((current) => !current)} aria-label="Toggle menu">{mobile ? <X size={20} /> : <Menu size={20} />}</button></div>

      {open === "products" && <div className="mega-menu mega-menu-products"><div className="mega-kicker"><span>THE COMPLETE STUDIO</span><strong>One brief across every medium.</strong><Link href="/#platform">See all products <ArrowRight size={14} /></Link></div><div className="mega-grid">{products.map(([name, copy, href, Icon]) => <Link href={href} key={name}><Icon size={20} /><span><strong>{name}</strong><small>{copy}</small></span><ArrowRight size={14} /></Link>)}</div></div>}
      {open === "solutions" && <div className="mega-menu"><div className="mega-kicker"><span>BUILT AROUND THE OUTCOME</span><strong>Choose the work, not the model.</strong><Link href="/#platform">Explore the platform <ArrowRight size={14} /></Link></div><div className="mega-link-grid">{solutions.map(([name, copy, href]) => <Link href={href} key={name}><strong>{name}</strong><small>{copy}</small></Link>)}</div></div>}
      {open === "resources" && <div className="mega-menu"><div className="mega-kicker"><span>LEARN AND BUILD</span><strong>From first brief to full control.</strong><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer">About ResoluteX HQ <ArrowRight size={14} /></a></div><div className="mega-link-grid">{resources.map(([name, copy, href]) => <Link href={href} key={name}><strong>{name}</strong><small>{copy}</small></Link>)}<a href="https://www.resolutexhq.com/careers" target="_blank" rel="noreferrer"><strong>Careers</strong><small>Build the next creative operating system</small></a><a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer"><strong>About</strong><small>Meet the company behind OpenCreative</small></a></div></div>}
    </header>
  );
}
