"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Aperture,
  BadgeDollarSign,
  AudioLines,
  Bot,
  CircleUserRound,
  Clapperboard,
  ChevronDown,
  Coins,
  FolderOpen,
  GalleryHorizontalEnd,
  Images,
  Inbox,
  LayoutGrid,
  Menu,
  Mic2,
  Music2,
  Package,
  Palette,
  PanelLeftClose,
  PlugZap,
  Settings,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Create",
    items: [
      ["AI Ad", "/create/ad", WandSparkles],
      ["UGC Ad", "/create/ugc", UserRound],
      ["Product Video", "/create/product-video", Clapperboard],
      ["AI Video", "/studio/video", Aperture],
      ["AI Image", "/studio/image", Images],
      ["Avatar", "/studio/avatar", CircleUserRound],
      ["Voice", "/studio/audio", AudioLines],
      ["Music · Beta", "/studio/music", Music2],
      ["Agents", "/studio/agents", Bot],
      ["Dub & Translate", "/studio/audio?mode=dub", Mic2],
    ],
  },
  {
    label: "Identities",
    items: [
      ["Brands", "/identities/brands", Palette],
      ["Products", "/identities/products", Package],
      ["Avatars", "/identities/avatars", CircleUserRound],
      ["Voices", "/identities/voices", Mic2],
    ],
  },
  {
    label: "Workspace",
    items: [
      ["Projects", "/workspace/projects", FolderOpen],
      ["Assets", "/workspace/assets", GalleryHorizontalEnd],
      ["Generations", "/workspace/generations", Sparkles],
    ],
  },
] as const;

export function AppSidebar({
  workspaceName,
  plan,
}: {
  workspaceName: string;
  plan: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(pathname.startsWith("/account"));
  const [navigating, setNavigating] = useState("");
  const search = searchParams.toString();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setNavigating(""));
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);

  function beginNavigation(href: string) {
    const [nextPath, nextQuery = ""] = href.split("?");
    if (nextPath !== pathname || nextQuery !== search) setNavigating(href);
    setOpen(false);
  }
  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}
      <aside
        className={cn(
          "app-sidebar",
          open && "sidebar-open",
          collapsed && "sidebar-collapsed",
        )}
      >
        <span className={cn("route-progress", navigating && "is-active")} aria-hidden="true" />
        <div className="sidebar-head">
          <Link href="/app">
            <BrandMark compact={collapsed} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
          >
            {open ? (
              <X size={18} onClick={() => setOpen(false)} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
        </div>
        <Link
          href="/app"
          onClick={() => beginNavigation("/app")}
          className={cn("sidebar-home", pathname === "/app" && "active")}
        >
          <LayoutGrid size={17} />
          <span>Home</span>
        </Link>
        <nav className="sidebar-nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(([label, href, Icon]) => {
                const [hrefPath, hrefQuery] = href.split("?");
                const isDub = hrefQuery === "mode=dub";
                const active = isDub
                  ? pathname === hrefPath && searchParams.get("mode") === "dub"
                  : href === "/studio/audio"
                    ? pathname === href && searchParams.get("mode") !== "dub"
                    : pathname.startsWith(hrefPath);
                return (
                <Link
                  href={href}
                  key={href}
                  onClick={() => beginNavigation(href)}
                  className={cn(active && "active")}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            type="button"
            className={cn("sidebar-account-toggle", accountOpen && "is-open", pathname.startsWith("/account") && "active")}
            onClick={() => setAccountOpen((current) => !current)}
            aria-expanded={accountOpen}
          >
            <Settings size={17} />
            <span>Support &amp; account</span>
            <ChevronDown className="sidebar-account-chevron" size={15} />
          </button>
          <div className={cn("sidebar-account-menu", accountOpen && "is-open")}>
            <Link href="/account/support" onClick={() => beginNavigation("/account/support")} className={pathname === "/account/support" ? "active" : ""}>
              <Inbox size={16} /><span>Support inbox</span>
            </Link>
            <Link href="/account/mcp" onClick={() => beginNavigation("/account/mcp")} className={pathname === "/account/mcp" ? "active" : ""}>
              <PlugZap size={16} /><span>MCP &amp; API keys</span>
            </Link>
            <Link href="/account/affiliate" onClick={() => beginNavigation("/account/affiliate")} className={pathname === "/account/affiliate" ? "active" : ""}>
              <BadgeDollarSign size={16} /><span>Affiliate earnings</span>
            </Link>
            <Link href="/account/credits" onClick={() => beginNavigation("/account/credits")} className={pathname === "/account/credits" ? "active" : ""}>
              <Coins size={16} /><span>Credits &amp; billing</span>
            </Link>
            <Link href="/account/settings" onClick={() => beginNavigation("/account/settings")} className={pathname === "/account/settings" ? "active" : ""}>
              <Settings size={16} /><span>Settings</span>
            </Link>
          </div>
          <div className="workspace-switch">
            <span className="workspace-avatar">
              {workspaceName.slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{workspaceName}</strong>
              <small>{plan} plan</small>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
