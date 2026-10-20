import { describe, expect, it } from "vitest";
import { interpret } from "@/os/voice-commands";

describe("voice commands", () => {
  it.each([
    ["Open Josh's CV", { kind: "open", route: { app: "resume", sub: [] } }],
    ["hey Josh, show me the projects", { kind: "open", route: { app: "projects", sub: [] } }],
    ["take me to the app store", { kind: "open", route: { app: "appstore", sub: [] } }],
    ["films", { kind: "open", route: { app: "tv", sub: [] } }],
    ["play snake", { kind: "open", route: { app: "arcade", sub: ["snake"] } }],
    ["dark mode", { kind: "theme", theme: "dark" }],
    ["tile this to the left", { kind: "tile", layout: "left" }],
    ["mission control", { kind: "overlay", overlay: "mission-control" }],
    ["make it snow", { kind: "sky", sky: "snow" }],
    ["pause the music", { kind: "pause" }],
  ])("understands “%s”", (heard, expected) => {
    expect(interpret(heard)).toMatchObject(expected);
  });

  it("plays an artist, accents or not, and a song by name", () => {
    const tiesto = interpret("play some Tiesto");
    expect(tiesto.kind).toBe("play");
    expect(tiesto.say).toBe("Playing Tiësto");
    const song = interpret("play Levels");
    expect(song).toMatchObject({ kind: "play", say: "Playing Levels" });
  });

  it("passes anything else to the assistant as a question", () => {
    expect(interpret("What's Josh's favourite project?")).toEqual({ kind: "ask", question: "What's Josh's favourite project?", say: "Asking Josh's assistant" });
  });
});
