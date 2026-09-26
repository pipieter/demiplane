import BackgroundView from "../../src/views/background";
import { Mock, beforeEach, describe, expect, test, vi } from "vitest";

describe("BackgroundView", () => {
  let view: BackgroundView;
  let setSpy: Mock;

  beforeEach(() => {
    view = new BackgroundView();
    setSpy = vi.spyOn(view, "set");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.image).toBeDefined();
      expect(view.layers.length).toBe(4);
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
