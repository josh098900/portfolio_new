// London weather for the desktop widget. London stands in for Josh's location
// on purpose. Open-Meteo is tried first, then MET Norway: both are free and
// keyless, and each successful response is cached for half an hour.

export type Condition = "clear" | "mostly-clear" | "partly-cloudy" | "cloudy" | "fog" | "drizzle" | "rain" | "sleet" | "snow" | "thunder";

export type Weather = {
  place: string;
  temperature: number;
  high: number;
  low: number;
  condition: Condition;
  isDay: boolean;
  source: "Open-Meteo" | "MET Norway";
};

const LONDON = { lat: 51.5074, lon: -0.1278 };
const REVALIDATE = 1800;
const TIMEOUT = 4000;

async function getJson(url: string, headers?: HeadersInit) {
  const res = await fetch(url, { headers, next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(`${new URL(url).host} responded ${res.status}`);
  return res.json();
}

// WMO weather interpretation codes, as used by Open-Meteo.
function fromWmo(code: number): Condition {
  if (code === 0) return "clear";
  if (code === 1) return "mostly-clear";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code === 66 || code === 67) return "sleet";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "thunder";
  return "rain";
}

async function fromOpenMeteo(): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LONDON.lat}&longitude=${LONDON.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FLondon&forecast_days=1`;
  const data = await getJson(url);
  return {
    place: "London",
    temperature: data.current.temperature_2m,
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0],
    condition: fromWmo(data.current.weather_code),
    isDay: data.current.is_day === 1,
    source: "Open-Meteo",
  };
}

// MET Norway symbol codes, e.g. "partlycloudy_day" or "lightrainshowers_night".
function fromSymbol(symbol: string): Condition {
  const name = symbol.replace(/_(day|night|polartwilight)$/, "");
  if (name === "clearsky") return "clear";
  if (name === "fair") return "mostly-clear";
  if (name === "partlycloudy") return "partly-cloudy";
  if (name === "cloudy") return "cloudy";
  if (name === "fog") return "fog";
  if (name.includes("thunder")) return "thunder";
  if (name.includes("sleet")) return "sleet";
  if (name.includes("snow")) return "snow";
  return "rain";
}

const londonDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" });

async function fromMetNorway(): Promise<Weather> {
  // MET Norway's terms ask every client to identify itself.
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LONDON.lat}&lon=${LONDON.lon}`;
  const data = await getJson(url, { "User-Agent": "josh-portfolio/1.0 github.com/josh098900/portfolio_new" });
  type Step = { time: string; data: { instant: { details: { air_temperature: number } }; next_1_hours?: { summary: { symbol_code: string } } } };
  const steps: Step[] = data.properties.timeseries;
  const now = steps[0];
  const today = londonDate.format(new Date(now.time));
  const temps = steps.filter(s => londonDate.format(new Date(s.time)) === today).map(s => s.data.instant.details.air_temperature);
  const symbol = now.data.next_1_hours?.summary.symbol_code ?? "cloudy";
  return {
    place: "London",
    temperature: now.data.instant.details.air_temperature,
    high: Math.max(...temps),
    low: Math.min(...temps),
    condition: fromSymbol(symbol),
    isDay: !symbol.endsWith("_night"),
    source: "MET Norway",
  };
}

export async function getLondonWeather(): Promise<Weather | null> {
  for (const provider of [fromOpenMeteo, fromMetNorway]) {
    try {
      return await provider();
    } catch (error) {
      console.warn(`Weather provider failed: ${error instanceof Error ? error.message : error}`);
    }
  }
  return null;
}
