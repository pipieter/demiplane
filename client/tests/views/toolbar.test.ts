import ToolbarView from "../../src/views/toolbar";
import { beforeEach, describe, expect, test } from "vitest";

describe("ToolbarView", () => {
  let view: ToolbarView;
  const tabs = ["draw", "grid", "token", "user"]; // Can't be defined dynamically due to how vitest works.

  beforeEach(() => {
    view = new ToolbarView();
  });

  describe("Initialization", () => {
    test("should find all toolbar sections and menus", () => {
      expect(view.settingsSection).toBeDefined();
      expect(view.drawSection).toBeDefined();
      expect(view.boardSection).toBeDefined();
      expect(view.menus.length).toBeGreaterThan(1);
    });

    test("should start with all menus hidden", () => {
      for (const menu of view.menus) {
        expect(menu.style.display).toBe("none");
      }
    });
  });

  describe("Menu Selection", () => {
    test.each(tabs)("clicking the %s button should show its menu and hide others", (tabName) => {
      const button = document.querySelector(`[data-tab="${tabName}"]`) as HTMLButtonElement;
      const menu = document.getElementById(`tab-${tabName}`) as HTMLElement;

      button.click();

      expect(menu.style.display).toBe("");
      expect(button.classList.contains("selected")).toBe(true);

      for (const otherMenu of view.menus) {
        if (otherMenu !== menu) {
          expect(otherMenu.style.display).toBe("none");
        }
      }

      for (const otherButton of document.querySelectorAll<HTMLButtonElement>(
        '.toolbar-button[data-tab]:not([data-tab="help"]):not([data-tab="background"])',
      )) {
        if (otherButton !== button) {
          expect(otherButton.classList.contains("selected")).toBe(false);
        }
      }
    });

    test("clicking the selected button should hide its menu", () => {
      const button = document.querySelector('[data-tab="grid"]') as HTMLButtonElement;
      const menu = document.getElementById("tab-grid") as HTMLElement;

      button.click();
      button.click();

      expect(menu.style.display).toBe("none");
      expect(button.classList.contains("selected")).toBe(false);
    });

    test("pressing Escape should hide all menus and clear button selection", () => {
      const button = document.querySelector('[data-tab="token"]') as HTMLButtonElement;

      button.click();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

      expect(button.classList.contains("selected")).toBe(false);
      for (const menu of view.menus) {
        expect(menu.style.display).toBe("none");
      }
    });
  });
});
