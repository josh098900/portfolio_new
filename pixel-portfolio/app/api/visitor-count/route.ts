import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COUNT_KEY = 'visitor-count';
const VISITOR_COOKIE = 'pf_visitor';
// How long before the same browser is counted again. One year ≈ "unique visitor".
// Drop to 60 * 60 * 24 for a "unique per day" count instead.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Read the current total without changing it.
export async function GET() {
  const count = (await kv.get<number>(COUNT_KEY)) ?? 0;
  return NextResponse.json({ count, success: true });
}

// Count this visitor once, then return the total.
export async function POST() {
  const cookieStore = await cookies();
  const alreadyCounted = cookieStore.has(VISITOR_COOKIE);

  if (alreadyCounted) {
    const count = (await kv.get<number>(COUNT_KEY)) ?? 0;
    return NextResponse.json({ count, success: true, counted: false });
  }

  const count = await kv.incr(COUNT_KEY);
  const response = NextResponse.json({ count, success: true, counted: true });
  response.cookies.set(VISITOR_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return response;
}
