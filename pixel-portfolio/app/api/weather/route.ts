import { getLondonWeather } from "@/lib/weather";

export async function GET() {
  const weather = await getLondonWeather();
  if (!weather) {
    return Response.json({ error: "Weather is unavailable right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(weather, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
}
