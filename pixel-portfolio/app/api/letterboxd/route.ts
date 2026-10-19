import { getDiary } from "@/lib/letterboxd";

export async function GET() {
  const diary = await getDiary();
  if (!diary) {
    return Response.json({ error: "Letterboxd isn't available right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(diary, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
}
