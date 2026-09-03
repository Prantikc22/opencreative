/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Bot,
  Clapperboard,
  Code2,
  Fingerprint,
  Globe2,
  ImageIcon,
  Mic2,
  Music2,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Video,
  WandSparkles,
} from "lucide-react";
import { AgentDemo } from "@/components/marketing/agent-demo";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MusicDemo } from "@/components/marketing/music-demo";
import { ScrollMotion } from "@/components/marketing/scroll-motion";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SupportAgentWidget } from "@/components/marketing/support-agent-widget";
import { VoiceDemos } from "@/components/marketing/voice-demos";

const customerMarks = [
  { name: "eBay", logo: "https://cdn.simpleicons.org/ebay/000000" },
  { name: "Randstad", logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Randstad%20Logo.svg" },
  { name: "The Baker’s Street", logo: "https://www.thebakersstreet.com/brand-wordmark.png" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/000000" },
  { name: "RVCJ Media", logo: null },
] as const;

const avatars = [
  ["Mina", "Founder energy", "01"], ["Malik", "Bold and direct", "02"],
  ["Elena", "Warm authority", "03"], ["Mateo", "Thoughtful expert", "04"],
  ["Ravi", "Friendly guide", "05"], ["Noa", "Editorial calm", "06"],
  ["Kenji", "Clear and bright", "07"], ["Amara", "High-energy host", "08"],
] as const;

const reactions = [
  { name: "Aisha Rao", handle: "@aishamakes", quote: "I started with one product idea and left with the launch film, voiceover, stills and social cuts. This is how a creative suite should feel." },
  { name: "Noah Williams", handle: "@noahbuilds", quote: "The credit estimate before generation changes everything. My team can choose the ambition before we spend a cent." },
  { name: "Sofia Martin", handle: "@sofiadirects", quote: "Brand memory is the real unlock. Every image, presenter and voice finally belongs to the same campaign world." },
  { name: "Dev Malhotra", handle: "@devcreates", quote: "Voice, music, avatars and video in one workspace means the idea survives all the way to the final export." },
  { name: "Amara Okafor", handle: "@amarafilm", quote: "I can test a visual world, hear its voice and score the cut before the client review. The feedback gets sharper because the work is already alive." },
  { name: "Kenji Sato", handle: "@kenjimakes", quote: "The language previews finally behave like language previews. My Tokyo and Madrid cuts stay inside the same campaign instead of becoming separate projects." },
  { name: "Lena Hart", handle: "@lenahart", quote: "OpenCreative gives our small team the range of a much larger studio without flattening every idea into the same template." },
  { name: "Ishan Mehta", handle: "@ishandirects", quote: "The support agent is the surprise. We built the launch assets and the product guide from the same source material." },
] as const;

const products = [
  { icon: ImageIcon, number: "01", title: "Image AI", copy: "Art direct campaign stills, product photography and visual concepts with your references intact.", className: "spectrum-image", href: "/studio/image", use: "Product launch" },
  { icon: Video, number: "02", title: "Video AI", copy: "Build shots, storyboards and finished campaign films without losing the thread between scenes.", className: "spectrum-video", href: "/studio/video", use: "Campaign film" },
  { icon: AudioLines, number: "03", title: "Voice AI", copy: "Direct expressive speech, clone authorized voices, translate dialogue and keep timing under control.", className: "spectrum-voice", href: "/studio/audio", use: "Global narration" },
  { icon: Music2, number: "04", title: "Music AI", copy: "Create original arrangements and sonic identities that land on the same creative brief.", className: "spectrum-music", href: "/studio/music", use: "Original score" },
  { icon: ScanFace, number: "05", title: "Avatar AI", copy: "Choose a global presenter or build an authorized digital twin for repeatable production.", className: "spectrum-avatar", href: "/studio/avatar", use: "Presenter video" },
  { icon: Bot, number: "06", title: "Agent AI", copy: "Give customers a voice-first support agent on phone, laptop, or inside your product widget.", className: "spectrum-agent", href: "/studio/agents", use: "Customer support" },
] as const;

function XLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="marketing-shell home-2026">
      <ScrollMotion />
      <MarketingNav />

      <section className="hero-2026">
        <div className="hero-film" aria-hidden="true">
          <video autoPlay muted loop playsInline preload="metadata" poster="/hero-imagination-warm.png"><source src="/opencreative-hero-v2.mp4" type="video/mp4" /><source src="/opencreative-hero.mp4" type="video/mp4" /></video>
          <div className="hero-film-shade" />
        </div>
        <div className="hero-copy-2026">
          <p><Sparkles size={15} /> The entire marketing studio</p>
          <h1>One idea.<br /><em>Every way it can move.</em></h1>
          <span>Create the film, campaign stills, presenter, voice, music and support agent in one directed workspace.</span>
          <div className="hero-actions-2026"><Link className="oc-button oc-button-coral" href="/signup">Make your first campaign <ArrowRight size={17} /></Link><a className="oc-button oc-button-outline-light" href="#platform">Explore the platform</a></div>
          <small>50 free credits · No card · Open-source core</small>
        </div>
        <div className="hero-format-rail" aria-hidden="true"><span>IMAGE</span><span>VIDEO</span><span>VOICE</span><span>MUSIC</span><span>AVATAR</span><span>AGENT</span></div>
      </section>

      <section className="customer-band" aria-label="Teams using OpenCreative">
        <header><span>BUILT FOR TEAMS LIKE</span><p>One creative system for every channel and every market.</p></header>
        <div className="logo-marquee"><div className="logo-track">{[...customerMarks, ...customerMarks].map(({ name, logo }, index) => <article key={`${name}-${index}`} aria-label={name}>{logo ? <img src={logo} alt={`${name} logo`} loading="lazy" /> : <span className="logo-wordmark" aria-label={`${name} logo`}>RVCJ</span>}</article>)}</div></div>
      </section>

      <section className="platform-spectrum" id="platform">
        <header className="home-display-heading"><p>THE CREATIVE SUPER APP</p><h2>Stop assembling a stack.<br /><em>Start making the work.</em></h2><span>Six creative systems share one brief, one brand memory and one asset library. Nothing gets lost between tools.</span></header>
        <div className="spectrum-grid">
          {products.map(({ icon: Icon, number, title, copy, className, href, use }) => <article className={className} key={title}><header><span>{number}</span><Icon size={24} /></header><div className="product-use-visual"><Icon size={34} /><span>{use}</span><i /></div><h3>{title}</h3><p>{copy}</p><Link href={href}>Open studio <ArrowRight size={15} /></Link></article>)}
        </div>
      </section>

      <section className="workflow-2026">
        <header className="home-display-heading"><p>ONE CONTINUOUS CREATIVE LOOP</p><h2>From “we should make this”<br /><em>to ready for the world.</em></h2></header>
        <div className="workflow-board-2026">
          <div className="workflow-brief-2026"><span>01 · BRIEF</span><h3>Launch a fragrance that feels like the city after midnight.</h3><footer><b>NOIR PARFUMS</b><small>Audience and brand memory loaded</small></footer></div>
          <div className="workflow-frames-2026"><figure><Image src="/hero-showcase.png" alt="Fragrance product campaign concept" fill sizes="30vw" /><figcaption>02 · CONCEPT</figcaption></figure><figure><Image src="/hero-imagination-v2.png" alt="Cinematic campaign direction" fill sizes="30vw" /><figcaption>03 · DIRECT</figcaption></figure></div>
          <div className="workflow-output-2026"><span>04 · PUBLISH</span><div><Clapperboard size={18} /><b>1 launch film</b><small>20 seconds</small></div><div><ImageIcon size={18} /><b>8 campaign stills</b><small>4 formats</small></div><div><Mic2 size={18} /><b>3 voiceovers</b><small>3 languages</small></div><div><Music2 size={18} /><b>1 original track</b><small>30 seconds</small></div></div>
        </div>
      </section>

      <section className="avatar-section-2026" id="avatars">
        <header className="home-display-heading"><p>GLOBAL PRESENTERS</p><h2>Find the face<br /><em>the story deserves.</em></h2><span>Every presenter opens the Avatar Studio with that selection ready. No detours.</span></header>
        <div className="avatar-grid-2026">{avatars.map(([name, trait, id]) => <Link href={`/studio/avatar?presenter=${name.toLowerCase()}`} key={name}><Image src={`/avatars/avatar-${id}.png`} alt={`${name}, ${trait}`} fill sizes="(max-width: 700px) 50vw, 25vw" /><span>{trait}</span><strong>{name}</strong><small>Open in studio <ArrowRight size={12} /></small></Link>)}</div>
      </section>

      <section className="voice-section-2026" id="voices">
        <header className="home-display-heading home-display-light"><p>VOICE WITHOUT BORDERS</p><h2>One message.<br /><em>A world of voices.</em></h2><span>Preview expressive speakers, switch languages and direct the performance before you generate.</span></header>
        <VoiceDemos />
      </section>

      <section className="music-section-2026">
        <div className="music-copy-2026"><p>MUSIC AI</p><h2>Give the campaign<br /><em>its own pulse.</em></h2><span>Describe a mood, choose the duration and generate an original arrangement. Keep the music beside the campaign.</span><Link className="oc-button oc-button-dark" href="/studio/music">Make music <ArrowRight size={16} /></Link></div>
        <MusicDemo />
      </section>

      <section className="agents-section-2026" id="agents">
        <header className="home-display-heading"><p>OPENCREATIVE AGENTS</p><h2>Support that listens.<br /><em>Answers that act.</em></h2><span>Customers speak through the microphone on any phone or laptop. Your agent uses the company knowledge base and can live inside a support widget.</span></header>
        <AgentDemo />
      </section>

      <section className="orchestration-2026">
        <header className="home-display-heading home-display-light"><p>CREATIVE ORCHESTRATION</p><h2>You direct the ambition.<br /><em>We route the work.</em></h2></header>
        <div className="orchestration-flow-2026"><article className="orchestration-source"><span>YOUR INPUT</span><strong>One living brief</strong><small>Brand · audience · channel · budget</small></article><div className="orchestration-lines" aria-hidden="true"><i /><i /><i /><i /></div><article className="orchestration-engine"><WandSparkles size={26} /><span>OPENCREATIVE</span><strong>Quality, speed and cost balanced per asset.</strong></article><div className="orchestration-lines" aria-hidden="true"><i /><i /><i /><i /></div><article className="orchestration-result"><span>YOUR OUTPUT</span><strong>One coherent campaign</strong><small>Ready in every format</small></article></div>
        <div className="orchestration-models-2026"><span>FAST / EXPLORE</span><span>STANDARD / BALANCE</span><span>PREMIUM / FINISH</span><span>ADVANCED / CONTROL</span></div>
      </section>

      <section className="reactions-2026" id="proof">
        <header className="home-display-heading"><p>FROM THE CREATOR COMMUNITY</p><h2>The work speaks.<br /><em>Creators speak louder.</em></h2></header>
        <div className="reaction-window"><div className="reaction-track">{[...reactions, ...reactions].map((reaction, index) => <article key={`${reaction.handle}-${index}`}><header><div className="x-mark"><XLogo /></div><span>{reaction.name}<small>{reaction.handle}</small></span></header><p>“{reaction.quote}”</p><footer>Mentioned on X</footer></article>)}</div></div>
        <button className="reaction-more" type="button">More creator reactions are arriving</button>
      </section>

      <section className="showcase-2026" id="showcase">
        <header className="home-display-heading home-display-light"><p>MADE WITH OPENCREATIVE</p><h2>One brief.<br /><em>Four original worlds.</em></h2><span>Each project below was art directed as its own campaign, not recycled from the hero.</span></header>
        <div className="showcase-grid-2026"><figure className="showcase-hero-card"><Image src="/showcase/forest-fragrance.png" alt="Amber fragrance campaign beside a forest stream" fill sizes="60vw" /><figcaption><span>PRODUCT FILM</span><strong>ROOT / FIRST LIGHT</strong><small>Image · Video · Music</small></figcaption></figure><figure><Image src="/showcase/coastal-serum.png" alt="Coastal skincare creator campaign" fill sizes="30vw" /><figcaption><span>CREATOR CAMPAIGN</span><strong>FIELD / OPEN AIR</strong></figcaption></figure><figure><Image src="/showcase/alpine-drive.png" alt="Automotive campaign at an alpine lake" fill sizes="30vw" /><figcaption><span>LAUNCH STORY</span><strong>NORTH / BLUE HOUR</strong></figcaption></figure><figure><Image src="/showcase/forest-studio.png" alt="Music producer in a forest listening studio" fill sizes="30vw" /><figcaption><span>ORIGINAL MUSIC</span><strong>CANOPY / LIVE SIGNAL</strong></figcaption></figure></div>
      </section>

      <section className="safety-2026" id="safety">
        <header className="home-display-heading"><p>SAFETY, BUILT INTO THE WORK</p><h2>Create boldly.<br /><em>Keep control.</em></h2></header>
        <div><article><Fingerprint size={32} /><span>01</span><h3>Consent</h3><p>Voice and avatar identities require explicit authorization before generation.</p></article><article><ShieldCheck size={32} /><span>02</span><h3>Private assets</h3><p>Workspace media stays private with controlled access and expiring delivery links.</p></article><article><Globe2 size={32} /><span>03</span><h3>Provenance</h3><p>Generation records keep models, inputs and outputs connected for accountability.</p></article><article><Code2 size={32} /><span>04</span><h3>Open core</h3><p>Inspect the stack, bring your provider keys and self-host when you need full control.</p></article></div>
      </section>

      <section className="final-cta-2026">
        <div className="final-cta-rings" aria-hidden="true"><i /><i /><i /><i /></div>
        <div><p>THE IDEA IS ENOUGH</p><h2>Bring the spark.<br /><em>Leave with the campaign.</em></h2><span>Start with 50 credits. Move from image to film, voice, music and agent without leaving the studio.</span><div><Link className="oc-button oc-button-coral" href="/signup">Start creating free <ArrowRight size={16} /></Link><Link className="oc-button oc-button-outline-light" href="/pricing">See pricing</Link></div></div>
      </section>
      <SupportAgentWidget />
      <SiteFooter />
    </main>
  );
}
