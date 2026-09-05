import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TransformView from "../../src/views/transform";
import TokenMapView from "../../src/views/tokenmap";
import { Token } from "../../src/models/token";
import mocking from "../mocking";
import Grid from "../../src/models/grid";
import Viewport from "../../src/models/viewport";

describe("TransformView", () => {
  let view: TransformView;
  let tokenView: TokenMapView;
  let emitSpy: Mock;

  const tokens: Token[] = mocking.token.getOneEach();

  beforeEach(() => {
    view = new TransformView(new Grid(new Viewport()));
    tokenView = new TokenMapView();
    emitSpy = vi.spyOn(view, "emit");

    for (const token of tokens) {
      tokenView.create(token);
      view.makeDraggable(token);
    }
  });

  describe("Input Handling", () => {
    test.each(tokens)("should select a $type token on mousedown", (token) => {
      view.setSelected([token]);
      const element = document.getElementById(token.id)!;
      element.dispatchEvent(new MouseEvent("mousedown"));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [token]);
    });
  });
});
