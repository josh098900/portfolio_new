// Josh's CV as a PDF, written directly (no library): A4 pages of Helvetica
// text laid out from content/resume.ts, with clickable LinkedIn and GitHub
// links. Like the site, it leaves out phone, email and home town.

import { lookingFor, resume } from "@/content/resume";

const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 48;
const WIDTH = PAGE.w - MARGIN * 2;

// Helvetica glyph widths (per 1000 em) for printable ASCII, from the standard font metrics.
const ASCII_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667,
  611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833,
  556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

// The few characters beyond ASCII the CV uses, as WinAnsi codes with their widths.
const EXTRA: Record<string, [number, number]> = {
  "é": [0xe9, 556], "è": [0xe8, 556], "–": [0x96, 556], "—": [0x97, 1000], "‘": [0x91, 222], "’": [0x92, 222],
  "“": [0x93, 333], "”": [0x94, 333], "•": [0x95, 350], "·": [0xb7, 278], "…": [0x85, 1000], "ë": [0xeb, 556],
};

/** Text as WinAnsi bytes (in a string), with PDF string escapes. */
function encode(text: string) {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    const byte = code >= 32 && code < 127 ? code : EXTRA[ch]?.[0] ?? 63;
    const c = String.fromCharCode(byte);
    out += c === "(" || c === ")" || c === "\\" ? `\\${c}` : c;
  }
  return out;
}

export function textWidth(text: string, size: number, bold = false) {
  let units = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    units += code >= 32 && code < 127 ? ASCII_WIDTHS[code - 32] : EXTRA[ch]?.[1] ?? 556;
  }
  // Bold Helvetica runs about 6% wider; enough for wrapping.
  return (units / 1000) * size * (bold ? 1.06 : 1);
}

function wrap(text: string, size: number, width: number, bold = false) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, bold) > width) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

type Link = { x: number; y: number; w: number; h: number; uri: string };

class Layout {
  pages: { ops: string[]; links: Link[] }[] = [];
  y = 0;
  constructor() { this.newPage(); }
  get page() { return this.pages[this.pages.length - 1]; }
  newPage() { this.pages.push({ ops: [], links: [] }); this.y = PAGE.h - MARGIN; }
  space(points: number) { if (this.y - points < MARGIN) this.newPage(); }
  text(text: string, x: number, size: number, bold = false, grey = false) {
    this.page.ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${grey ? "0.4 0.4 0.42 rg" : "0.11 0.11 0.12 rg"} ${x.toFixed(2)} ${this.y.toFixed(2)} Td (${encode(text)}) Tj ET`);
  }
  paragraph(text: string, size = 10, indent = 0, bullet = false) {
    const lines = wrap(text, size, WIDTH - indent - (bullet ? 12 : 0));
    lines.forEach((line, i) => {
      this.space(size * 1.36);
      this.y -= size * 1.36;
      if (bullet && i === 0) this.text("•", MARGIN + indent, size);
      this.text(line, MARGIN + indent + (bullet ? 12 : 0), size);
    });
  }
  heading(text: string) {
    this.space(30);
    this.y -= 20;
    this.text(text.toUpperCase(), MARGIN, 10, true);
    this.y -= 6;
    this.page.ops.push(`0.8 0.8 0.82 RG 0.6 w ${MARGIN} ${this.y.toFixed(2)} m ${PAGE.w - MARGIN} ${this.y.toFixed(2)} l S`);
  }
}

/** The CV as PDF bytes. */
export function resumePdf(): Uint8Array {
  const doc = new Layout();
  doc.y -= 22;
  doc.text(resume.name, MARGIN, 24, true);
  doc.y -= 18;
  doc.text(resume.headline, MARGIN, 12, false, true);
  doc.y -= 16;
  doc.text(`${lookingFor}.`, MARGIN, 10, true);

  // Links, laid out on one line and clickable.
  doc.y -= 16;
  let x = MARGIN;
  for (const link of resume.links) {
    const label = `${link.label}: ${link.display}`;
    doc.text(label, x, 9.5, false, true);
    doc.page.links.push({ x, y: doc.y - 2, w: textWidth(label, 9.5), h: 12, uri: link.href });
    x += textWidth(label, 9.5) + 18;
  }

  doc.heading("Profile");
  doc.paragraph(resume.summary);

  doc.heading("Education");
  for (const e of resume.education) {
    doc.space(30);
    doc.y -= 16;
    doc.text(e.title, MARGIN, 11, true);
    doc.text(e.when, PAGE.w - MARGIN - textWidth(e.when, 9.5), 9.5, false, true);
    doc.paragraph(e.place, 10);
    for (const p of e.points) doc.paragraph(p, 10, 4, true);
  }

  doc.heading("Projects");
  for (const p of resume.projects) {
    doc.space(28);
    doc.y -= 14;
    doc.text(p.title, MARGIN, 11, true);
    doc.paragraph(p.line, 10);
    doc.paragraph(`Built with ${p.stack}.`, 9.5);
  }

  doc.heading("Experience");
  for (const e of resume.experience) {
    doc.space(30);
    doc.y -= 16;
    doc.text(e.title, MARGIN, 11, true);
    doc.text(e.when, PAGE.w - MARGIN - textWidth(e.when, 9.5), 9.5, false, true);
    doc.paragraph(e.place, 10);
    for (const p of e.points) doc.paragraph(p, 10, 4, true);
  }

  doc.heading("Skills");
  for (const s of resume.skills) doc.paragraph(`${s.label}: ${s.items.join(", ")}`);
  doc.paragraph(`Strengths: ${resume.softSkills.join(", ")}`);

  doc.heading("References");
  doc.paragraph(resume.references);

  // Assemble the file: catalogue, page tree, two fonts, then each page and its contents.
  const objects: string[] = [];
  const add = (body: string) => { objects.push(body); return objects.length; };
  const catalog = add("");
  const pages = add("");
  const regular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const bold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const kids: number[] = [];
  for (const page of doc.pages) {
    const stream = page.ops.join("\n");
    const contents = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const annots = page.links.map(l => add(`<< /Type /Annot /Subtype /Link /Rect [${l.x.toFixed(2)} ${l.y.toFixed(2)} ${(l.x + l.w).toFixed(2)} ${(l.y + l.h).toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${encode(l.uri)}) >> >>`));
    kids.push(add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${PAGE.w} ${PAGE.h}] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${contents} 0 R${annots.length ? ` /Annots [${annots.map(a => `${a} 0 R`).join(" ")}]` : ""} >>`));
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pages} 0 R >>`;
  objects[pages - 1] = `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  const info = add(`<< /Title (${encode(`${resume.name} CV`)}) /Author (${encode(resume.name)}) /Creator (josh-portfolio) >>`);

  let file = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => { offsets.push(file.length); file += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = file.length;
  file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  // Every character is a single byte (WinAnsi), so offsets above are byte offsets.
  return Uint8Array.from(file, ch => ch.charCodeAt(0));
}
