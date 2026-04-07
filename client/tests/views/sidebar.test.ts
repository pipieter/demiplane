import { beforeEach, describe, expect, test } from "vitest";
import SidebarView from "../../src/views/sidebar";

describe("SidebarView", () => {
  let view: SidebarView;
  const tabs = ["draw", "grid", "token", "user"]; // Can't be defined dynamically due to how vitest works.

  beforeEach(() => {
    view = new SidebarView();
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.content).toBeDefined();
      expect(view.hideButton).toBeDefined();
      expect(view.tabs.length).toBeGreaterThan(1);
      expect(view.tabButtons.length).toBeGreaterThan(1);
    });

    test("should have a button for every tab", () => {
      expect(view.tabs.length).toBe(4);
      expect(view.tabButtons.length).toBe(view.tabs.length);
    });

    test("should start with content not visible", () => {
      expect(view.content.classList.contains("visible")).toBe(false);
    });
  });

  describe("Input Handling", () => {
    test.each(tabs)("clicking the %s-button should show its panel and hide others", (tabName) => {
      const btn = document.querySelector(`[data-tab="${tabName}"]`) as HTMLButtonElement;
      const tab = document.getElementById(`tab-${tabName}`) as HTMLElement;

      btn.click();

      expect(view.content.classList.contains("visible")).toBe(true);
      expect(tab.hidden).toBe(false);
      expect(btn.classList.contains("selected")).toBe(true);

      const otherTabs = tabs.filter((t) => t !== tabName);
      otherTabs.forEach((otherName) => {
        const otherPanel = document.getElementById(`tab-${otherName}`) as HTMLElement;
        const otherBtn = document.querySelector(`[data-tab="${otherName}"]`) as HTMLButtonElement;

        expect(otherPanel.hidden).toBe(true);
        expect(otherBtn?.classList.contains("selected")).toBe(false);
      });
    });

    test("clicking the hide button should clear selection regardless of which tab was open", () => {
      tabs.forEach((tabName) => {
        const btn = document.querySelector(`[data-tab="${tabName}"]`) as HTMLButtonElement;

        btn.click();
        expect(view.content.classList.contains("visible")).toBe(true);

        view.hideButton.click();

        expect(view.content.classList.contains("visible")).toBe(false);
        expect(btn.classList.contains("selected")).toBe(false);
      });
    });
  });
});
