import Link from "next/link";
import { Icon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return <header className="site-header container">
    <Link href="/" className="wordmark" aria-label="Josh, home">josh<span>.</span></Link>
    <nav aria-label="Main navigation">
      <Link href="/#work">Work</Link>
      <Link href="/#about">About</Link>
      <Link href="/#now">Now<span className="nav-dot" /></Link>
    </nav>
    <div className="header-actions">
      <a href="https://github.com/josh098900" target="_blank" rel="noreferrer" className="icon-button" aria-label="Josh on GitHub (opens in a new tab)"><Icon name="github" /></a>
      <span className="action-divider" aria-hidden="true" />
      <ThemeToggle />
    </div>
  </header>;
}
