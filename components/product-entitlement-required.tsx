import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import type { ProductFamily } from "@/lib/entitlements";

export function ProductEntitlementRequired({ family }: { family: ProductFamily }) {
  const isAgent = family === "agents";
  return <section className="coming-soon-panel"><span><LockKeyhole size={28} /></span><p className="eyebrow">Separate product access</p><h2>{isAgent ? "Add OpenCreative Agents" : "Add Creative Studio"}</h2><p>{isAgent ? "Your current subscription unlocks creative production. Agent minutes and deployments are billed separately." : "Your current subscription unlocks customer agents. Creative generation credits are billed separately."}</p><Link className="button button-dark" href={`/pricing#plans`}>Compare {isAgent ? "agent" : "creative"} plans <ArrowRight size={16} /></Link></section>;
}
