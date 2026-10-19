import { defaultWallpaper, wallpapers } from "./wallpapers";

// Kept out of the client modules so the server layout receives the string itself.
// Picks the shell (mirrors detect() in os/shell.ts), theme and wallpaper before first paint.

const wallpaperIds = JSON.stringify(wallpapers.map(w => w.id));

/** Runs in <head> before first paint, so CSS can lay out the right shell before hydration. */
export const preflightScript = `(function(){var d=document.documentElement,w=innerWidth,h=innerHeight,c=matchMedia("(pointer: coarse)").matches;d.dataset.shell=(w<640||(c&&Math.min(w,h)<500))?"phone":(w<1024||c)?"tablet":"desktop";var t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",p="${defaultWallpaper}";try{var s=localStorage.getItem("josh-theme");if(s==="light"||s==="dark")t=s;var x=localStorage.getItem("josh-wallpaper");if(${wallpaperIds}.indexOf(x)>-1)p=x}catch(e){}d.dataset.theme=t;d.dataset.wallpaper=p})();`;
