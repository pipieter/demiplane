import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import GridView from "../../src/views/grid";

describe("GridView", () => {
  let view: GridView;
  let emitSpy: Mock;

  beforeEach(() => {
    view = new GridView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.defaultLockedInput).toBeDefined();
      expect(view.sizeInput).toBeDefined();
      expect(view.offsetXInput).toBeDefined();
      expect(view.offsetYInput).toBeDefined();
      expect(view.pattern).toBeDefined();
      expect(view.path).toBeDefined();
    });
  });

  describe("Input Handling", () => {
    test("should emit grid_change when size is updated", () => {
      view.sizeInput.value = "100";

      view.sizeInput.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("grid_change", {
        size: 100,
        offsetX: 0,
        offsetY: 0,
      });
    });

    test("should emit set_default_grid_locked when checkbox changes", () => {
      view.defaultLockedInput.checked = true;
      view.defaultLockedInput.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("set_default_grid_locked", true);
    });
  });

  describe("set() method", () => {
    test("should update input values and SVG pattern attributes", () => {
      const size = 128;
      const x = 10;
      const y = 20;

      view.set(size, x, y);

      expect(view.sizeInput.value).toBe("128");
      expect(view.offsetXInput.min).toBe("-64");
      expect(view.offsetXInput.max).toBe("64");
      expect(view.pattern.getAttribute("width")).toBe("128px");
      expect(view.pattern.getAttribute("patternTransform")).toBe("translate(10, 20)");
      expect(view.path.getAttribute("d")).toBe("M 128 0 L 0 0 0 128");
    });
  });
});
