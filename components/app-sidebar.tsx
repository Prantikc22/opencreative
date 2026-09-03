"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Aperture,
  AudioLines,
  Bot,
  CircleUserRound,
  Clapperboard,
  Coins,
  FolderOpen,
  GalleryHorizontalEnd,
  Images,
  LayoutGrid,
  Menu,
  Mic2,
  Music2,
  Package,
  Palette,
  PanelLeftClose,
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
      ["Music", "/studio/music", Music2],
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
                  onClick={() => setOpen(false)}
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
          <Link href="/account/credits">
            <Coins size={17} />
            <span>Credits & billing</span>
          </Link>
          <Link href="/account/settings">
            <Settings size={17} />
            <span>Settings</span>
          </Link>
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
