import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL, SYSTEM_PROMPT, type ChatTurn } from "@/lib/server/assistant";
import { checkLimits, guardAvailable, json, sameOrigin, saveReply, visitorId } from "@/lib/server/guard";

export const maxDuration = 30;

const MAX_BODY = 32_000;
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 2_000;
const MAX_TURNS = 10;

const busy = "Josh's assistant is busy right now. Please try again in a minute.";
const resting = "Josh's assistant is resting at the moment. You can still explore the site, or get in touch with Josh directly.";

function parseTurns(raw: string): ChatTurn[] | null {
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return null; }
  const list = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > 40) return null;
  const turns: ChatTurn[] = [];
  for (const item of list) {
    const { role, content } = (item ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text || text.length > (role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) return null;
    turns.push({ role, content: text });
  }
  if (turns.at(-1)!.role !== "user") return null;
  // Keep the recent turns, starting on a user turn.
  const recent = turns.slice(-MAX_TURNS);
  while (recent[0]?.role === "assistant") recent.shift();
  return recent;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Not allowed." }, 403);
  if (!guardAvailable) {
    console.error("Chat refused: no Redis configured on Vercel (KV_REST_API_URL / KV_REST_API_TOKEN).");
    return json({ error: resting }, 503);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Chat refused: ANTHROPIC_API_KEY is not set.");
    return json({ error: resting }, 503);
  }

  const limit = await checkLimits("chat", visitorId(request));
  if (!limit.ok) {
    return json({ error: limit.scope === "visitor"
      ? "That's a lot of questions! Please wait a little before asking another."
      : "Josh's assistant has answered lots of questions today. Please try again tomorrow." }, 429);
  }

  const raw = await request.text();
  const turns = raw.length <= MAX_BODY ? parseTurns(raw) : null;
  if (!turns) return json({ error: `That message couldn't be sent. Messages need to be under ${MAX_USER_CHARS} characters.` }, 400);

  const stream = anthropic().messages.stream({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: turns,
  }, { signal: request.signal });

  // Wait for Anthropic to accept the request, so failures get a proper status.
  try {
    await stream.withResponse();
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError || error instanceof Anthropic.APIConnectionError) {
      return json({ error: busy }, 503);
    }
    if (error instanceof Anthropic.APIError) {
      // Covers a bad key and an empty credit balance; the details stay in the server log.
      console.error(`Anthropic request failed (${error.status}): ${error.message}`);
      return json({ error: resting }, 503);
    }
    throw error;
  }

  const replyId = crypto.randomUUID();
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            text += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal" && !text) {
          text = "Sorry, I can't help with that one. I'm happy to tell you about Josh's projects, though.";
          controller.enqueue(encoder.encode(text));
        }
        const { input_tokens, cache_creation_input_tokens, cache_read_input_tokens, output_tokens } = message.usage;
        console.info(`chat ok: ${input_tokens} in, ${cache_creation_input_tokens ?? 0} cache write, ${cache_read_input_tokens ?? 0} cache read, ${output_tokens} out`);
        if (text) await saveReply(replyId, text);
        controller.close();
      } catch (error) {
        if (!request.signal.aborted) console.error(`Chat stream failed: ${error instanceof Error ? error.message : error}`);
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Reply-Id": replyId },
  });
}
