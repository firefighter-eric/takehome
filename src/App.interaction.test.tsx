// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { STORAGE_KEY } from "./state/persistence";

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  } as unknown as Storage;
}

describe("App interactions", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    cleanup();
  });

  it("updates results, navigates by hash, and restores saved inputs", async () => {
    const first = render(<App />);
    const gross = screen.getByLabelText("税前月薪") as HTMLInputElement;
    fireEvent.focus(gross);
    fireEvent.change(gross, { target: { value: "80000" } });
    fireEvent.blur(gross);

    expect(gross.value).toBe("80,000");

    fireEvent.click(screen.getByRole("button", { name: "工作对比" }));
    expect(screen.getByRole("heading", { name: "对比两个工作" })).toBeTruthy();
    expect(window.location.hash).toBe("#/compare");
    expect(screen.getAllByText("¥1,200,000").length > 0).toBe(true);

    await waitFor(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      expect(stored).toContain('"monthlyGross":80000');
    });

    first.unmount();
    window.history.replaceState(null, "", "/");
    render(<App />);
    expect((screen.getByLabelText("税前月薪") as HTMLInputElement).value).toBe("80,000");
  });

  it("moves focus into the info dialog, traps Escape, and restores focus", async () => {
    render(<App />);
    const trigger = screen.getByRole("button", { name: "计算说明" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    await waitFor(() => {
      expect(document.activeElement?.getAttribute("aria-label")).toBe("关闭计算说明");
    });

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });
});
