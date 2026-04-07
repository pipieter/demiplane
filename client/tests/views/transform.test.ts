import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TransformView from "../../src/views/transform";
import Grid from "../../src/models/grid";
import Viewport from "../../src/models/viewport";
import TokenView from "../../src/views/token";
import { Token } from "../../src/models/token";
import mocking from "../mocking";
import { util } from "../../src/util";

describe("TransformView", () => {
  let viewport: Viewport;
  let grid: Grid;
  let view: TransformView;
  let tokenView: TokenView;
  let emitSpy: Mock;

  const tokens: Token[] = mocking.token.getOneEach();

  beforeEach(() => {
    viewport = new Viewport();
    grid = new Grid(viewport);
    view = new TransformView(grid);
    tokenView = new TokenView();
    emitSpy = vi.spyOn(view, "emit");

    for (const token of tokens) {
      tokenView.create(token);
      view.makeDraggable(token);
    }
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.container).toBeDefined();
      expect(view.layer).toBeDefined();

      expect(view.box).toBeDefined();
      expect(view.handles.length).toBe(6);
      expect(view.rotateHandle).toBeDefined();
      expect(view.rotateLine).toBeDefined();

      expect(view.lineLayer).toBeDefined();
      expect(view.line).toBeDefined();
    });
  });

  describe("Input Handling", () => {
    test.each(tokens)("should emit 'token_transform' when dragging a $type token", (token) => {
      view.setSelected([token]);
      const element = document.getElementById(token.id)!;
      const clientX = 200;
      const clientY = 200;

      vi.spyOn(util, "mouseOnElement").mockReturnValue(true);
      vi.spyOn(grid, "getCoordinates").mockReturnValue({ x: clientX, y: clientY });
      element.dispatchEvent(new MouseEvent("mousedown"));

      const moveEvent = new MouseEvent("mousemove", { clientX, clientY });
      document.dispatchEvent(moveEvent);

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [token]);
      expect(emitSpy).toHaveBeenLastCalledWith(
        "token_transform",
        expect.objectContaining({
          id: token.id,
          name: token.name,
        }),
      );
    });
  });

  describe("setSelected() method", () => {
    test.each(tokens.filter((t) => t.type !== "line"))(
      "should position the transform-box correctly for a $type",
      (token) => {
        view.setSelected([token]);

        expect(view.layer.style.display).toBe("block");
        expect(view.lineLayer.style.display).toBe("none");

        expect(view.box.getAttribute("x")).toBe(token.x.toString());
        expect(view.box.getAttribute("y")).toBe(token.y.toString());
        expect(view.box.getAttribute("transform")).toContain(`rotate(${token.r}`);
      },
    );

    test("should position the transform-line correctly for a line", () => {
      const line = tokens.find((t) => t.type === "line")!;
      view.setSelected([line]);

      expect(view.layer.style.display).toBe("none");
      expect(view.lineLayer.style.display).toBe("block");

      expect(view.line.getAttribute("x1")).toBe(line.x.toString());
      expect(view.line.getAttribute("x2")).toBe((line.x + line.w).toString());
      expect(view.line.getAttribute("y1")).toBe(line.y.toString());
      expect(view.line.getAttribute("y2")).toBe((line.y + line.h).toString());
    });

    test.each(tokens)("should hide transform-layer if deselecting $type", (token) => {
      view.setSelected([token]);
      view.setSelected([]);

      expect(view.layer.style.display).toBe("none");
      expect(view.lineLayer.style.display).toBe("none");
    });
  });
});
