import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return <main id="main" className="container not-found"><span className="eyebrow">404 / A SMALL DETOUR</span><h1>Nothing here.<br /><em>Plenty to explore.</em></h1><Link href="/" className="text-link"><Icon name="back" /> Back to the portfolio</Link></main>;
}
