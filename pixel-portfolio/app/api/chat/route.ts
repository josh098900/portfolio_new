import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Rate limiting: Track requests per IP (in-memory, resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // Max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute window

// Limits to prevent token abuse
const MAX_MESSAGE_LENGTH = 500; // Max chars per message
const MAX_CONVERSATION_LENGTH = 10; // Max messages in history
const MAX_TOKENS = 300; // Max response tokens

const SYSTEM_PROMPT = `You are Josh's AI assistant on his portfolio website. You're friendly, helpful, and speak in a casual but professional tone. Keep responses concise (2-3 sentences max).

ABOUT JOSH:
- Name: Joshua Mathers
- Role: Web Developer / Full Stack Developer
- Currently seeking web development opportunities
- Passionate about creating interactive, creative web experiences
- Has a pixel art themed portfolio

SKILLS:
Frontend: React (1 year), Next.js (1 year), TypeScript (1 year), HTML5 (4 years), CSS3 (4 years), Tailwind CSS (1 year)
Backend: Node.js (2 years), Python (5 years)
Tools: Git (3 years)

PROJECTS:
1. TravelGlobe - Interactive 3D visualization of travel history using Globe.GL
2. Severance Fan Project - Interactive fan-made web app for the Apple TV series
3. Laptop Survival 101 - Humorous interactive game about a lecturer's tech struggles
4. Chaos Engine - D&D session tool for random event generation
5. F1 Canadian GP Dashboard - Real-time weather dashboard for the Canadian Grand Prix

GUIDELINES:
- Be helpful and enthusiastic about Josh's work
- If asked about contacting Josh, direct them to the Contact page
- If asked about projects, describe them briefly and mention the Projects page
- Keep responses brief (2-3 sentences)
- Use a friendly, approachable tone
- If you don't know something specific about Josh, say so honestly
- You can use emojis sparingly to match the playful portfolio vibe
- Stay on topic - only discuss Josh's portfolio, skills, and projects
- Politely redirect off-topic questions back to the portfolio`;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const { messages } = await req.json();

    // Validate messages exist
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Convert and validate messages
    const convertedMessages = messages
      .slice(-MAX_CONVERSATION_LENGTH) // Only keep recent messages
      .map((msg: { role: string; parts?: { type: string; text: string }[]; content?: string }) => {
        let content = msg.content;
        if (!content && msg.parts) {
          content = msg.parts
            .filter((part: { type: string }) => part.type === 'text')
            .map((part: { text: string }) => part.text)
            .join('');
        }
        // Truncate long messages
        content = (content || '').slice(0, MAX_MESSAGE_LENGTH);
        return { 
          role: msg.role as 'user' | 'assistant', 
          content 
        };
      });

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SYSTEM_PROMPT,
      messages: convertedMessages,
      maxOutputTokens: MAX_TOKENS,
    });

    return Response.json({ response: result.text });
  } catch {
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
