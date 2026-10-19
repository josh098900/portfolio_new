import { checkLimits, findReply, guardAvailable, json, sameOrigin, visitorId } from "@/lib/server/guard";

export const maxDuration = 30;

// Alice: a clear, British premade ElevenLabs voice. Override with ELEVENLABS_VOICE_ID.
const VOICE = process.env.ELEVENLABS_VOICE_ID || "Xb7hH8MSUJpSbSDYk0k2";
const MAX_CHARS = 700;
const resting = "The voice is resting for now. You can still read every reply.";

/** Reads one of the assistant's own replies aloud. It never accepts free text. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Not allowed." }, 403);
  if (!guardAvailable || !process.env.ELEVENLABS_API_KEY) {
    console.error("Speech refused: ELEVENLABS_API_KEY or the Redis store is missing.");
    return json({ error: resting }, 503);
  }

  let id: unknown;
  try { ({ id } = await request.json()); } catch { /* handled below */ }
  const text = typeof id === "string" ? await findReply(id) : null;
  if (!text) return json({ error: "That reply can't be read aloud any more." }, 404);

  const limit = await checkLimits("voice", visitorId(request));
  if (!limit.ok) return json({ error: "That's the voice's limit for today, but you can keep reading." }, 429);

  // Speak link labels rather than URLs.
  const spoken = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").slice(0, MAX_CHARS);

  let upstream: Response;
  try {
    upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text: spoken, model_id: "eleven_flash_v2_5" }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return json({ error: resting }, 503);
  }
  if (!upstream.ok || !upstream.body) {
    // Includes the free plan's monthly allowance running out.
    console.error(`ElevenLabs request failed (${upstream.status}): ${(await upstream.text()).slice(0, 200)}`);
    return json({ error: resting }, 503);
  }

  return new Response(upstream.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, no-store" },
  });
}
