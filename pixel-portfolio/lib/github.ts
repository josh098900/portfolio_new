// Josh's public GitHub activity, summarised for the Activity app. Uses the
// public REST API (no token needed; GITHUB_TOKEN raises the rate limit if set)
// and caches successful responses for an hour.

const USER = "josh098900";
const HOUR = 3600;

export type Activity = {
  user: { login: string; repos: number; followers: number; since: string };
  rings: { pushes: { value: number; goal: number }; days: { value: number; goal: number }; repos: { value: number; goal: number } };
  days: { date: string; pushes: number }[];
  languages: { name: string; repos: number }[];
  recent: { repo: string; at: string }[];
  updated: string;
};

async function github<T>(path: string): Promise<T> {
  const headers: HeadersInit = { accept: "application/vnd.github+json", "user-agent": "josh-portfolio" };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: HOUR }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`GitHub ${path} responded ${res.status}`);
  return res.json();
}

const day = (iso: string) => iso.slice(0, 10);

export async function getActivity(): Promise<Activity | null> {
  try {
    type User = { login: string; public_repos: number; followers: number; created_at: string };
    type Repo = { name: string; language: string | null; fork: boolean };
    type Event = { type: string; created_at: string; repo: { name: string } };
    const [user, repos, events] = await Promise.all([
      github<User>(`/users/${USER}`),
      github<Repo[]>(`/users/${USER}/repos?per_page=100&sort=pushed`),
      github<Event[]>(`/users/${USER}/events/public?per_page=100`),
    ]);

    const pushes = events.filter(e => e.type === "PushEvent");
    const now = Date.now();
    const within = (iso: string, days: number) => now - Date.parse(iso) < days * 86_400_000;
    const week = pushes.filter(e => within(e.created_at, 7));

    const counts = new Map<string, number>();
    for (const e of pushes) counts.set(day(e.created_at), (counts.get(day(e.created_at)) ?? 0) + 1);
    const days = Array.from({ length: 28 }, (_, i) => {
      const date = new Date(now - (27 - i) * 86_400_000).toISOString().slice(0, 10);
      return { date, pushes: counts.get(date) ?? 0 };
    });

    const languages = new Map<string, number>();
    for (const r of repos) if (!r.fork && r.language) languages.set(r.language, (languages.get(r.language) ?? 0) + 1);

    const recent: Activity["recent"] = [];
    for (const e of pushes) {
      const repo = e.repo.name.split("/")[1];
      if (!recent.some(r => r.repo === repo)) recent.push({ repo, at: e.created_at });
      if (recent.length === 5) break;
    }

    return {
      user: { login: user.login, repos: user.public_repos, followers: user.followers, since: user.created_at.slice(0, 4) },
      rings: {
        pushes: { value: week.length, goal: 15 },
        days: { value: new Set(week.map(e => day(e.created_at))).size, goal: 5 },
        repos: { value: new Set(pushes.filter(e => within(e.created_at, 30)).map(e => e.repo.name)).size, goal: 4 },
      },
      days,
      languages: [...languages].map(([name, count]) => ({ name, repos: count })).sort((a, b) => b.repos - a.repos).slice(0, 6),
      recent,
      updated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`GitHub activity unavailable: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}
