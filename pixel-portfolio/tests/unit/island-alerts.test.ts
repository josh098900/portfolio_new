import { afterEach, describe, expect, it, vi } from "vitest";
import { useLive } from "@/os/live";

afterEach(() => {
  useLive.getState().dismiss();
  vi.useRealTimers();
});

describe("Dynamic Island alerts", () => {
  it("queues an achievement behind the alert that earned it", () => {
    vi.useFakeTimers();
    const { flash } = useLive.getState();
    flash({ glyph: "moon", title: "Dark Mode", detail: "On" });
    flash({ glyph: "star", title: "Night Owl", detail: "Unlocked" }, { queue: true });
    expect(useLive.getState().alert?.title).toBe("Dark Mode");
    vi.advanceTimersByTime(2800);
    expect(useLive.getState().alert?.title).toBe("Night Owl");
    vi.advanceTimersByTime(2800);
    expect(useLive.getState().alert).toBeNull();
  });

  it("shows a queued alert straight away when nothing else is showing", () => {
    useLive.getState().flash({ glyph: "star", title: "DJ" }, { queue: true });
    expect(useLive.getState().alert?.title).toBe("DJ");
  });

  it("lets a new alert replace the one showing, keeping what's queued", () => {
    vi.useFakeTimers();
    const { flash } = useLive.getState();
    flash({ glyph: "moon", title: "Dark Mode" });
    flash({ glyph: "star", title: "Night Owl" }, { queue: true });
    flash({ glyph: "sun", title: "Light Mode" });
    expect(useLive.getState().alert?.title).toBe("Light Mode");
    vi.advanceTimersByTime(2800);
    expect(useLive.getState().alert?.title).toBe("Night Owl");
  });
});
