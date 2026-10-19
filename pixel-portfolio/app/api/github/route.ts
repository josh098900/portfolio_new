import { getActivity } from "@/lib/github";

export async function GET() {
  const activity = await getActivity();
  if (!activity) {
    return Response.json({ error: "GitHub activity is unavailable right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(activity, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
}
