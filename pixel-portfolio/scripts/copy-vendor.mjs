// Copies MapLibre's web worker (and the module it imports) into public/ so the
// browser can load it. Runs before dev and build so it always matches the
// installed version; public/vendor is not committed.
import { copyFileSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/vendor/maplibre/", import.meta.url);
mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(new URL(file, from), new URL(file, to));
