import { describe, expect, it, vi } from "vitest";
import { reflow } from "./reflow";

describe("reflow", () => {
  it("reads scrollTop to force layout", () => {
    const scrollTop = vi.fn(() => 0);
    const node = {
      get scrollTop() {
        return scrollTop();
      },
    } as unknown as HTMLElement;

    reflow(node);

    expect(scrollTop).toHaveBeenCalledOnce();
  });
});
