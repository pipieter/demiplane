import Grid from "../../src/models/grid";
import { getMoveable } from "../../src/models/moveable";
import { Token } from "../../src/models/token";
import Viewport from "../../src/models/viewport";
import TokenMapView from "../../src/views/tokenmap";
import TransformView from "../../src/views/transform";
import mocking from "../mocking";
import { Mock, beforeEach, describe, expect, test, vi } from "vitest";

describe("TransformView", () => {
  let view: TransformView;
  let tokenView: TokenMapView;
  let emitSpy: Mock;

  const tokens: Token[] = mocking.token.getOneEach();

  beforeEach(() => {
    view = new TransformView(new Grid(new Viewport()));
    tokenView = new TokenMapView();
    emitSpy = vi.spyOn(view, "emit");
    const moveable = getMoveable();
    vi.spyOn(moveable, "setState").mockImplementation(() => {});
    vi.spyOn(moveable, "updateRect").mockImplementation(() => {});
    vi.spyOn(moveable, "dragStart").mockImplementation(() => {});
    vi.spyOn(moveable, "waitToChangeTarget").mockResolvedValue();

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

    test("should start dragging on the first click-and-drag", async () => {
      const moveable = getMoveable();
      const event = new MouseEvent("mousedown");
      const element = document.getElementById(tokens[0].id)!;

      element.dispatchEvent(event);
      await Promise.resolve();

      expect(moveable.dragStart).toHaveBeenCalledWith(event, element);
    });

    test("should add a token to the selection with Ctrl-click", () => {
      view.setSelected([tokens[0]]);
      const element = document.getElementById(tokens[1].id)!;
      element.dispatchEvent(new MouseEvent("mousedown", { ctrlKey: true }));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [tokens[0], tokens[1]]);
    });

    test("should remove a token from the selection with Cmd-click", () => {
      view.setSelected([tokens[0], tokens[1]]);
      const element = document.getElementById(tokens[1].id)!;
      element.dispatchEvent(new MouseEvent("mousedown", { metaKey: true }));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [tokens[0]]);
    });

    test("should keep the whole selection when dragging an already selected token", () => {
      view.setSelected([tokens[0], tokens[1]]);
      const element = document.getElementById(tokens[0].id)!;
      element.dispatchEvent(new MouseEvent("mousedown"));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [tokens[0], tokens[1]]);
    });

    test("should use a single proxy target for Moveable with multiple selected tokens", () => {
      view.setSelected([tokens[0], tokens[1]]);

      expect(getMoveable().setState).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ id: "moveable-selection-proxy" }),
          rotatable: false,
        }),
        expect.any(Function),
      );
    });

    test("should keep rotation enabled for a single rotatable token", () => {
      view.setSelected([tokens[0]]);

      expect(getMoveable().setState).toHaveBeenCalledWith(
        expect.objectContaining({ target: document.getElementById(tokens[0].id), rotatable: true }),
        expect.any(Function),
      );
    });

    test("should not use Shift-click to toggle selection", () => {
      view.setSelected([tokens[0]]);
      const element = document.getElementById(tokens[1].id)!;
      element.dispatchEvent(new MouseEvent("mousedown", { shiftKey: true }));

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [tokens[1]]);
    });
  });
});
