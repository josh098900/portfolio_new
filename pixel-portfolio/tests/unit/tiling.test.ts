import { describe, expect, it } from "vitest";
import { layoutRect, snapAt } from "@/os/tiling";

const area = { left: 0, top: 30, w: 1440, h: 800 };

describe("window tiling", () => {
  it("splits the screen into halves and quarters with even gaps", () => {
    expect(layoutRect("left", area, { w: 900, h: 600 })).toEqual({ x: 8, y: 8, w: 708, h: 784 });
    expect(layoutRect("right", area, { w: 900, h: 600 })).toEqual({ x: 724, y: 8, w: 708, h: 784 });
    expect(layoutRect("bottom-right", area, { w: 900, h: 600 })).toEqual({ x: 724, y: 404, w: 708, h: 388 });
    expect(layoutRect("fill", area, { w: 900, h: 600 })).toEqual({ x: 8, y: 8, w: 1424, h: 784 });
  });

  it("centres a window without changing its size", () => {
    expect(layoutRect("centre", area, { w: 900, h: 600 })).toEqual({ x: 270, y: 100, w: 900, h: 600 });
  });

  it("snaps to edges and corners while dragging, and nowhere else", () => {
    expect(snapAt(2, 400, area)).toBe("left");
    expect(snapAt(1438, 400, area)).toBe("right");
    expect(snapAt(2, 40, area)).toBe("top-left");
    expect(snapAt(1438, 820, area)).toBe("bottom-right");
    expect(snapAt(700, 32, area)).toBe("fill");
    expect(snapAt(700, 400, area)).toBeNull();
  });
});
