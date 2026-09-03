"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins, LogOut, Settings } from "lucide-react";
export function AppTopbar({
  credits,
  name,
  email,
}: {
  credits: number;
  name: string;
  email: string;
}) {
  const [balance, setBalance] = useState(credits);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/credits/balance", { cache: "no-store" });
        const data = await response.json() as { balance?: number };
        if (active && response.ok && typeof data.balance === "number") setBalance(data.balance);
      } catch { /* Keep the last known balance when offline. */ }
    };
    void refresh();
    const interval = window.setInterval(refresh, 10000);
    window.addEventListener("opencreative:credits-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("opencreative:credits-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return (
    <header className="app-topbar">
      <div className="search-trigger">
        <span>Your creative workspace</span>
      </div>
      <div className="topbar-actions">
        <Link className={`credits-pill ${balance <= 25 ? "credits-low" : ""}`} href="/account/credits">
          <Coins size={15} />
          <strong>{balance}</strong>
          <span>{balance <= 25 ? "Add credits" : "credits"}</span>
        </Link>
        <details className="user-menu">
          <summary className="user-avatar" title={email} aria-label="Open account menu">
            {name.slice(0, 1).toUpperCase()}
          </summary>
          <div className="user-menu-panel">
            <header>
              <strong>{name}</strong>
              <small>{email}</small>
            </header>
            <Link href="/account/settings">
              <Settings size={16} /> Settings
            </Link>
            <Link href="/account/credits">
              <Coins size={16} /> Credits & billing
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit">
                <LogOut size={16} /> Log out
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
