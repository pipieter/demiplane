import { beforeEach, describe, expect, test, vi } from "vitest";
import HoverView from "../../src/views/hover";
import TokenMapView from "../../src/views/tokenmap";
import { TokenCircle, TokenImage, TokenLine, TokenRectangle } from "../../src/models/token";
import mocking from "../mocking";

describe("HoverView", () => {
  let view: HoverView;
  let tokenView: TokenMapView;

  let rectToken: TokenRectangle;
  let circleToken: TokenCircle;
  let lineToken: TokenLine;
  let imageToken: TokenImage;

  beforeEach(() => {
    view = new HoverView();
    tokenView = new TokenMapView();

    rectToken = mocking.token.getRect({ x: 100, y: 100, r: 35 });
    circleToken = mocking.token.getCircle({ x: 200, y: 200, r: -40 });
    lineToken = mocking.token.getLine({ x: 300, y: 300, w: 120, h: 0 });
    imageToken = mocking.token.getImage({ x: 400, y: 400, r: 180 });

    for (const token of [rectToken, circleToken, lineToken, imageToken]) {
      tokenView.create(token);
      view.makeHoverable(token);
    }
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.objects).toBeDefined();
      expect(view.layer).toBeDefined();
      expect(view.box).toBeDefined();
    });
  });

  describe("Input Handling (makeHoverable)", () => {
    test("should show and update box on mouseenter", () => {
      const token = rectToken;
      const element = document.getElementById(token.id)!;

      element.dispatchEvent(new MouseEvent("mouseenter"));

      expect(view.layer.style.display).toBe("");
      expect(view.box.getAttribute("x")).toBe(token.x.toString());
      expect(view.box.getAttribute("y")).toBe(token.y.toString());
      expect(view.box.getAttribute("width")).toBe(token.w.toString());
      expect(view.box.getAttribute("height")).toBe(token.h.toString());
      expect(view.box.getAttribute("transform")).toContain(`rotate(${token.r} 0 0)`);
      expect(view.layer.style.display).not.toBe("none");
    });

    test("should hide box on mouseleave", () => {
      const element = document.getElementById(circleToken.id)!;

      element.dispatchEvent(new MouseEvent("mouseenter"));
      element.dispatchEvent(new MouseEvent("mouseleave"));

      expect(view.layer.style.display).toBe("none");
    });
  });

  describe("update() method logic", () => {
    test("should ignore rotation if token type is 'line'", () => {
      const element = document.getElementById(lineToken.id)!;
      element.dispatchEvent(new MouseEvent("mouseenter"));

      expect(view.box.getAttribute("transform")).toBe("rotate(0 0 0)");
    });

    test("should clear hovered state if element no longer exists in DOM", () => {
      document.getElementById(imageToken.id)!.dispatchEvent(new MouseEvent("mouseenter"));

      document.getElementById(imageToken.id)!.remove();

      view.update();

      expect(view.layer.style.display).toBe("none");
    });
  });

  describe("MutationObserver Integration", () => {
    test("should trigger update when DOM changes", async () => {
      const updateSpy = vi.spyOn(view, "update");

      const newElem = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      view.objects.appendChild(newElem);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
