// Plain module so routing can validate /arcade/<game> on the server.

export const games = [
  { id: "pong", name: "Pong", blurb: "First to 7 against the computer." },
  { id: "snake", name: "Snake", blurb: "Eat, grow, don't bite yourself." },
  { id: "bricks", name: "Bricks", blurb: "Clear the wall with three balls." },
  { id: "lab-hangout", name: "Lab Hangout", blurb: "Josh's multiplayer pixel world." },
] as const;

export type GameId = (typeof games)[number]["id"];

export function findGame(id: string | undefined) {
  return games.find(g => g.id === id);
}
