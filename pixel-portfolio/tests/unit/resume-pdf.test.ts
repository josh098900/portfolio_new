import { describe, expect, it } from "vitest";
import { resumePdf, textWidth } from "@/lib/resume-pdf";

const text = () => String.fromCharCode(...resumePdf());

describe("the CV as a PDF", () => {
  it("is a one-page PDF with a valid cross-reference table", () => {
    const pdf = text();
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pdf).toMatch(/\/Type \/Pages \/Kids \[\d+ 0 R\] \/Count 1/);
    // Every object's offset in the xref table points at that object.
    const start = Number(pdf.match(/startxref\n(\d+)/)![1]);
    const rows = pdf.slice(start).split("\n").slice(3).filter(r => / 00000 n $/.test(r));
    rows.forEach((row, i) => expect(pdf.slice(Number(row.slice(0, 10)), Number(row.slice(0, 10)) + 12)).toMatch(new RegExp(`^${i + 1} 0 obj`)));
  });

  it("says who Josh is and what Josh is looking for, with working profile links", () => {
    const pdf = text();
    expect(pdf).toContain("(Joshua Mathers) Tj");
    expect(pdf).toContain("graduate software engineering roles");
    expect(pdf).toContain("/URI (https://www.linkedin.com/in/joshua-mathers-3410a7219)");
    expect(pdf).toContain("/URI (https://github.com/josh098900)");
  });

  it("contains no email address or phone number", () => {
    const pdf = text();
    expect(pdf).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    expect(pdf).not.toMatch(/\b07\d{3}\s?\d{3}\s?\d{3}\b/);
  });

  it("measures text with Helvetica's widths", () => {
    expect(textWidth("Hello", 10)).toBeCloseTo(22.78, 1);
  });
});
