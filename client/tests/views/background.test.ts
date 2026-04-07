import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import BackgroundView from "../../src/views/background";

describe("BackgroundView", () => {
  let view: BackgroundView;
  let emitSpy: Mock;

  beforeEach(() => {
    view = new BackgroundView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.input).toBeDefined();
      expect(view.image).toBeDefined();
      expect(view.layers.length).toBe(4);
    });
  });

  describe("Event Emission", () => {
    test("should emit background_upload when a file is selected", () => {
      const file = new File(["content"], "test.png", { type: "image/png" });

      const mockFileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
      };

      Object.defineProperty(view.input, "files", {
        value: mockFileList,
        writable: false,
        configurable: true,
      });

      view.input.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("background_upload", file);
    });

    test("should not emit if no file is selected", () => {
      Object.defineProperty(view.input, "files", {
        value: {
          length: 0,
          item: () => null,
        },
        configurable: true,
      });

      view.input.dispatchEvent(new Event("change"));

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe("set() method", () => {
    test("should update image href and all layer dimensions", () => {
      const href = "map.png";
      const w = 1920;
      const h = 1080;

      view.set(href, w, h);

      expect(view.image.getAttribute("href")).toBe(href);
      expect(view.image.getAttribute("width")).toBe("1920px");
      expect(view.image.getAttribute("height")).toBe("1080px");

      view.layers.forEach((layer) => {
        expect(layer.getAttribute("width")).toBe("1920px");
        expect(layer.getAttribute("height")).toBe("1080px");
      });
    });

    test("should remove href attribute if href is null", () => {
      view.set("image.png", 100, 100);
      expect(view.image.hasAttribute("href")).toBe(true);

      view.set(null, 100, 100);
      expect(view.image.hasAttribute("href")).toBe(false);
    });
  });
});
