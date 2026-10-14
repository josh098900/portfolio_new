import type { SVGProps } from "react";

type IconName = "arrow" | "down" | "github" | "sun" | "moon" | "compass" | "back";

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  if (name === "github") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.48-.28-5.08-1.24-5.08-5.51 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14A10.6 10.6 0 0 1 12 6.2c.94 0 1.88.13 2.77.37 2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.67.11 2.95.72.78 1.15 1.78 1.15 3.01 0 4.28-2.61 5.22-5.1 5.5.4.35.76 1.02.76 2.06v3.04c0 .3.2.64.77.53A11.1 11.1 0 0 0 12 .9Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === "arrow" && <path d="M6 18 18 6M6 6h12v12" />}
    {name === "down" && <path d="M12 4v16m-6-6 6 6 6-6" />}
    {name === "back" && <path d="M20 12H4m6-6-6 6 6 6" />}
    {name === "sun" && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
    {name === "moon" && <path d="M20.3 13.4A8.5 8.5 0 0 1 10.6 3.7a8.5 8.5 0 1 0 9.7 9.7Z" />}
    {name === "compass" && <><circle cx="12" cy="12" r="9" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" /></>}
  </svg>;
}
