import { Icon } from "./icons";

export function SiteFooter() {
  return <footer className="site-footer container">
    <div><span className="footer-name">Josh.</span><span className="footer-note">Always a work in progress.</span></div>
    <a href="https://github.com/josh098900" target="_blank" rel="noreferrer" className="footer-github" aria-label="Josh on GitHub (opens in a new tab)"><Icon name="github" /><span>Find me on GitHub</span><Icon name="arrow" /></a>
  </footer>;
}
