import Link from "next/link";
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
  return (
    <header className="app-topbar">
      <div className="search-trigger">
        <span>Your creative workspace</span>
      </div>
      <div className="topbar-actions">
        <Link className="credits-pill" href="/account/credits">
          <Coins size={15} />
          <strong>{credits}</strong>
          <span>credits</span>
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
