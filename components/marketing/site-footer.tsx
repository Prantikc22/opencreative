import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { productConfig } from "@/lib/config";

const footerGroups = [
  {
    label: "Create",
    links: [
      ["Images", "/studio/image"],
      ["Video", "/studio/video"],
      ["Avatars", "/studio/avatar"],
      ["Voices", "/studio/audio"],
      ["Music AI", "/studio/music"],
      ["Agents", "/studio/agents"],
    ],
  },
  {
    label: "Solutions",
    links: [
      ["Marketing teams", "/solutions/marketing"],
      ["Ecommerce", "/solutions/ecommerce"],
      ["Agencies", "/solutions/agencies"],
      ["Customer support", "/solutions/customer-support"],
    ],
  },
  {
    label: "Resources",
    links: [
      ["Self-hosting", "/open-source#self-hosting"],
      ["Pricing", "/pricing"],
      ["Safety", "/acceptable-use"],
      ["Showcase", "/#showcase"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer-redesign">
      <div className="site-footer-lead">
        <div>
          <Link href="/" aria-label={`${productConfig.name} home`}>
            <BrandMark />
          </Link>
          <h2>Make more.<br /><em>Subscribe less.</em></h2>
        </div>
        <div>
          <p>
            One open creative studio for images, video, voice, music, avatars and
            agents. No stack of expensive disconnected subscriptions.
          </p>
          <Link className="site-footer-cta" href="/signup">
            Start creating free <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <div className="site-footer-directory">
        <div className="site-footer-note">
          <span><i /> Open-source core</span>
          <p>{productConfig.tagline}</p>
        </div>
        {footerGroups.map((group) => (
          <nav key={group.label} aria-label={`${group.label} links`}>
            <span>{group.label}</span>
            {group.links.map(([label, href]) => (
              <Link href={href} key={label}>{label}</Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="site-footer-wordmark" aria-hidden="true">
        OpenCreative
      </div>

      <div className="site-footer-bottom">
        <small>© {new Date().getFullYear()} OpenCreative · A ResoluteX HQ product</small>
        <div>
          <a href="https://resolutexhq.com/" target="_blank" rel="noreferrer">Built by ResoluteX HQ <ArrowUpRight size={13} /></a>
          <a href="https://www.resolutexhq.com/about" target="_blank" rel="noreferrer">About</a>
          <a href="https://www.resolutexhq.com/careers" target="_blank" rel="noreferrer">Careers</a>
          <a href={productConfig.githubUrl} target="_blank" rel="noreferrer">
            <Code2 size={15} /> GitHub <ArrowUpRight size={13} />
          </a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund-policy">Refunds</Link>
          <Link href="/support">Support</Link>
        </div>
      </div>
    </footer>
  );
}
