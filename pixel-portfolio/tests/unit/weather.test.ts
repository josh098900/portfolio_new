import { afterEach, describe, expect, it, vi } from "vitest";
import { getLondonWeather } from "@/lib/weather";

const openMeteo = {
  current: { temperature_2m: 13.4, weather_code: 61, is_day: 0 },
  daily: { temperature_2m_max: [15.1], temperature_2m_min: [9.2] },
};

const metNorway = {
  properties: {
    timeseries: [
      { time: "2026-10-19T12:00:00Z", data: { instant: { details: { air_temperature: 12 } }, next_1_hours: { summary: { symbol_code: "lightsnowshowers_day" } } } },
      { time: "2026-10-19T15:00:00Z", data: { instant: { details: { air_temperature: 14 } } } },
      { time: "2026-10-19T21:00:00Z", data: { instant: { details: { air_temperature: 8 } } } },
      { time: "2026-10-20T09:00:00Z", data: { instant: { details: { air_temperature: 30 } } } },
    ],
  },
};

function respond(routes: Record<string, () => Response>) {
  const fetch = vi.fn(async (input: string | URL | Request) => {
    const host = new URL(String(input)).host;
    return routes[host]?.() ?? new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("London weather", () => {
  it("uses Open-Meteo when it answers", async () => {
    respond({ "api.open-meteo.com": () => Response.json(openMeteo) });
    expect(await getLondonWeather()).toEqual({
      place: "London", temperature: 13.4, high: 15.1, low: 9.2, condition: "rain", isDay: false, source: "Open-Meteo",
    });
  });

  it("falls back to MET Norway, using only today's temperatures for the high and low", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetch = respond({
      "api.open-meteo.com": () => new Response("busy", { status: 503 }),
      "api.met.no": () => Response.json(metNorway),
    });
    expect(await getLondonWeather()).toEqual({
      place: "London", temperature: 12, high: 14, low: 8, condition: "snow", isDay: true, source: "MET Norway",
    });
    // MET Norway asks every client to identify itself.
    const [, init] = fetch.mock.calls[1] as unknown as [string, RequestInit];
    expect(new Headers(init.headers).get("user-agent")).toMatch(/josh-portfolio/);
  });

  it("returns nothing when both services are down", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    respond({});
    expect(await getLondonWeather()).toBeNull();
  });

  it("only ever asks for London", async () => {
    const fetch = respond({ "api.open-meteo.com": () => Response.json(openMeteo) });
    await getLondonWeather();
    expect(String(fetch.mock.calls[0][0])).toContain("latitude=51.5074&longitude=-0.1278");
  });
});
