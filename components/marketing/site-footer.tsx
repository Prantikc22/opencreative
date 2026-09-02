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
    ],
  },
  {
    label: "Platform",
    links: [
      ["Pricing", "/pricing"],
      ["Brand DNA", "/#brand-memory"],
      ["Customer stories", "/#proof"],
      ["Open source", "/open-source"],
    ],
  },
  {
    label: "Resources",
    links: [
      ["Self-hosting", "/open-source#self-hosting"],
      ["Contributing", "/open-source#contributing"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
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
            One open creative studio for images, video, voice and avatars—without
            stacking four expensive subscriptions.
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

      <div className="site-footer-bottom">
        <small>© {new Date().getFullYear()} OpenCreative</small>
        <div>
          <a href={productConfig.githubUrl} target="_blank" rel="noreferrer">
            <Code2 size={15} /> GitHub <ArrowUpRight size={13} />
          </a>
          <a href={`mailto:${productConfig.supportEmail}`}>Contact</a>
        </div>
      </div>
    </footer>
  );
}
