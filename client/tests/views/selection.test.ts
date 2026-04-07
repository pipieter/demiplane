import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import SelectionView from "../../src/views/selection";
import TokenView from "../../src/views/token";
import mocking from "../mocking";
import { TokenCircle, TokenImage, TokenLine, TokenRectangle } from "../../src/models/token";

describe("SelectionView", () => {
  let view: SelectionView;
  let tokenView: TokenView;
  let emitSpy: Mock;

  let rectToken: TokenRectangle;
  let circleToken: TokenCircle;
  let lineToken: TokenLine;
  let imageToken: TokenImage;

  beforeEach(() => {
    view = new SelectionView();
    tokenView = new TokenView();
    emitSpy = vi.spyOn(view, "emit");

    rectToken = mocking.token.getRect({ x: 100, y: 100, r: 35 });
    circleToken = mocking.token.getCircle({ x: 200, y: 200, r: -40 });
    lineToken = mocking.token.getLine({ x: 300, y: 300, w: 120, h: 0 });
    imageToken = mocking.token.getImage({ x: 400, y: 400, r: 180 });

    for (const token of [rectToken, circleToken, lineToken, imageToken]) {
      tokenView.create(token);
    }
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.background).toBeDefined();
    });
  });

  describe("Input Handling", () => {
    test("should emit tokens_select with empty array when background is clicked", () => {
      view.background.dispatchEvent(new MouseEvent("click"));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", []);
    });

    test("should emit tokens_delete when Delete key is pressed and tokens are selected", () => {
      view.select([], [rectToken]);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

      expect(emitSpy).toHaveBeenCalledWith("tokens_delete", [rectToken]);
    });

    test("should emit tokens_delete when Backspace key is pressed and tokens are selected", () => {
      view.select([], [rectToken]);

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));

      expect(emitSpy).toHaveBeenCalledWith("tokens_delete", [rectToken]);
    });

    test("should NOT emit tokens_delete when focused on an input", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      view.select([], [rectToken]);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));

      expect(emitSpy).not.toHaveBeenCalledWith("tokens_delete", expect.anything());
      document.body.removeChild(input);
    });
  });

  describe("select() method", () => {
    test("should add 'selected' class to current tokens and remove from previous", () => {
      const rectEl = document.getElementById(rectToken.id);
      const circleEl = document.getElementById(circleToken.id);

      view.select([], [rectToken]);
      expect(rectEl?.classList.contains("selected")).toBe(true);

      view.select([rectToken], [circleToken]);
      expect(rectEl?.classList.contains("selected")).toBe(false);
      expect(circleEl?.classList.contains("selected")).toBe(true);
    });

    test("should track internal selected state for future deletion", () => {
      view.select([], [lineToken, imageToken]);
      view.delete();

      expect(emitSpy).toHaveBeenCalledWith("tokens_delete", [lineToken, imageToken]);
    });
  });
});
