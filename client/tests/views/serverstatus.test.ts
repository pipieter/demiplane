import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import ServerStatusView from "../../src/views/serverstatus";

describe("ServerStatusView", () => {
  let view: ServerStatusView;
  let emitSpy: Mock;

  beforeEach(() => {
    view = new ServerStatusView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.container).toBeDefined();
      expect(view.statusSymbol).toBeDefined();
      expect(view.statusText).toBeDefined();
    });

    test("should initialize in offline state", () => {
      expect(view.container.className).toBe("server-offline");
    });
  });

  describe("Input Handling", () => {
    test("should emit 'manual_sync' when clicked while not syncing", () => {
      view.setOnline();

      view.container.click();

      expect(emitSpy).toHaveBeenCalledWith("manual_sync", { isSyncing: false });
    });

    test("should NOT emit 'manual_sync' when clicked while already syncing", () => {
      view.setSyncing();

      view.container.click();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe("State Methods", () => {
    test("setSyncing() updates UI and sets cursor to progress", () => {
      view.setSyncing();

      expect(view.container.className).toBe("server-syncing");
      expect(view.statusSymbol.className).toContain("fa-rotate");
      expect(view.statusText.textContent).toBe("Syncing");
      expect(document.body.style.cursor).toBe("progress");
    });

    test("setOnline() updates UI and resets cursor", () => {
      view.setOnline();

      expect(view.container.className).toBe("server-online");
      expect(view.statusSymbol.className).toContain("fa-check");
      expect(view.statusText.textContent).toContain("Online");
      expect(document.body.style.cursor).toBe("default");
    });

    test("setOffline() updates UI and resets cursor", () => {
      view.setSyncing(); // Set different state first to ensure we're not using default.

      view.setOffline();

      expect(view.container.className).toBe("server-offline");
      expect(view.statusSymbol.className).toContain("fa-xmark");
      expect(view.statusText.textContent).toBe("Offline");
      expect(document.body.style.cursor).toBe("default");
    });
  });
});
