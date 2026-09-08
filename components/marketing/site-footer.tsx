import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { productConfig } from "@/lib/config";
import { creativeTools } from "@/lib/creative-tools";

const toolGroups = (["Video", "Image", "Audio", "World", "Characters"] as const).map((category) => ({
  label: category,
  links: creativeTools.filter((tool) => tool.category === category).map((tool) => [tool.name, tool.href] as const),
}));

const utilityGroups = [
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
      ["Developer API", "/developers"],
      ["Self-hosting", "/open-source#self-hosting"],
      ["Pricing", "/pricing"],
      ["Safety", "/acceptable-use"],
      ["Showcase", "/#showcase"],
      ["Compare", "/compare"],
      ["Affiliates", "/affiliates"],
      ["MCP", "/mcp"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer-redesign">
      <div className="site-footer-directory">
        <div className="site-footer-note">
          <Link href="/" aria-label={`${productConfig.name} home`}><BrandMark /></Link>
          <span><i /> Open-source core</span>
          <p>{productConfig.tagline}</p>
          <Link className="site-footer-all-tools" href="/tools">Explore all 32 tools <ArrowUpRight size={13} /></Link>
        </div>
        {toolGroups.map((group) => (
          <nav key={group.label} aria-label={`${group.label} links`}>
            <span>{group.label} tools</span>
            {group.links.map(([label, href]) => (
              <Link href={href} key={label}>{label}</Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="site-footer-utility">
        {utilityGroups.map((group) => <nav key={group.label} aria-label={`${group.label} links`}><span>{group.label}</span><div>{group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div></nav>)}
      </div>

      <div className="site-footer-wordmark" aria-hidden="true">
        Open<span>Creative</span>
      </div>

      <div className="site-footer-bottom">
        <small>© {new Date().getFullYear()} OpenCreative · A ResoluteX HQ product</small>
        <div>
          <a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a>
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
