import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <main id="main" className={`${styles.page} wallpaper-fill`}>
    <div className={`${styles.alert} glass`} role="alertdialog" aria-labelledby="missing-title" aria-describedby="missing-text">
      <span className={styles.icon} aria-hidden="true">?</span>
      <h1 id="missing-title">This page isn&apos;t here</h1>
      <p id="missing-text">The link might be old, or that app isn&apos;t ready yet.</p>
      <Link href="/" className={styles.button}>Go to the Desktop</Link>
    </div>
  </main>;
}
