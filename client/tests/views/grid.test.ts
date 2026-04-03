import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import GridView from "../../src/views/grid";

describe("GridView", () => {
  let view: GridView;
  let emitSpy: Mock;

  beforeEach(() => {
    view = new GridView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Input Handling", () => {
    test("should emit grid_change when size is updated", () => {
      const sizeInput = document.getElementById("grid-size") as HTMLInputElement;
      sizeInput.value = "100";

      sizeInput.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("grid_change", {
        size: 100,
        offsetX: 0,
        offsetY: 0,
      });
    });

    test("should emit set_default_grid_locked when checkbox changes", () => {
      const checkbox = document.getElementById("grid-global-checkbox") as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("set_default_grid_locked", true);
    });
  });

  describe("set() method", () => {
    test("should update input values and SVG pattern attributes", () => {
      const size = 128;
      const x = 10;
      const y = 20;

      view.set(size, x, y);

      const sizeInput = document.getElementById("grid-size") as HTMLInputElement;
      const xInput = document.getElementById("grid-offset-X") as HTMLInputElement;
      expect(sizeInput.value).toBe("128");

      expect(xInput.min).toBe("-64");
      expect(xInput.max).toBe("64");

      const pattern = document.getElementById("grid-pattern")!;
      expect(pattern.getAttribute("width")).toBe("128px");
      expect(pattern.getAttribute("patternTransform")).toBe("translate(10, 20)");

      const path = pattern.querySelector("path")!;
      expect(path.getAttribute("d")).toBe("M 128 0 L 0 0 0 128");
    });
  });
});
