import { beforeEach, describe, expect, test } from "vitest";
import TokenView from "../../src/views/token";
import mocking from "../mocking";

import { Token } from "../../src/models/token";

function assertDOMToken(token: Token) {
  const drawn = document.getElementById(token.id);
  expect(drawn).not.toBeNull();
  expect(drawn instanceof SVGElement).toBe(true);

  switch (token.type) {
    case "circle": {
      const borderOffset = token.border ? token.border / 2 : 0;
      const rx = token.w / 2 - borderOffset;
      const ry = token.h / 2 - borderOffset;

      expect(drawn?.tagName).toBe("ellipse");
      expect(drawn?.getAttribute("cx")).toBeCloseTo(token.x + rx);
      expect(drawn?.getAttribute("cy")).toBeCloseTo(token.y + ry);
      expect(drawn?.getAttribute("rx")).toBeCloseTo(rx);
      expect(drawn?.getAttribute("rx")).toBeCloseTo(ry);
      expect(drawn?.getAttribute("transform")).toContain(`rotate(${token.r}`);
      break;
    }

    case "rectangle": {
      const borderOffset = token.border ? token.border / 2 : 0;
      const x = token.x + borderOffset;
      const y = token.y + borderOffset;
      const w = token.w - (token.border || 0);
      const h = token.h - (token.border || 0);

      expect(drawn?.tagName).toBe("rect");
      expect(drawn?.getAttribute("x")).toBeCloseTo(x);
      expect(drawn?.getAttribute("y")).toBeCloseTo(y);
      expect(drawn?.getAttribute("width")).toBeCloseTo(w);
      expect(drawn?.getAttribute("height")).toBeCloseTo(h);
      expect(drawn?.getAttribute("transform")).toContain(`rotate(${token.r}`);
      break;
    }

    case "line":
      expect(drawn?.tagName).toBe("line");
      expect(drawn?.getAttribute("x1")).toBeCloseTo(token.x);
      expect(drawn?.getAttribute("y1")).toBeCloseTo(token.y);
      expect(drawn?.getAttribute("x2")).toBeCloseTo(token.x + token.w);
      expect(drawn?.getAttribute("y2")).toBeCloseTo(token.y + token.h);
      expect(drawn?.getAttribute("transform")).toBeNull(); // We don't rotate lines.
      break;

    case "image":
      expect(drawn?.tagName).toBe("image");
      expect(drawn?.getAttribute("x")).toBeCloseTo(token.x);
      expect(drawn?.getAttribute("y")).toBeCloseTo(token.y);
      expect(drawn?.getAttribute("width")).toBeCloseTo(token.w);
      expect(drawn?.getAttribute("height")).toBeCloseTo(token.h);
      expect(drawn?.getAttribute("transform")).toContain(`rotate(${token.r}`);
      break;

    default:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error(`Unsupported token type: ${(token as any).type}`);
  }
}

describe("TokenView", () => {
  let view: TokenView;

  beforeEach(() => {
    view = new TokenView();
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.layer).toBeDefined();
    });
  });

  describe("Token Creation", () => {
    test.each(mocking.token.getOneEach())("should be able to create $type", (token) => {
      const shouldBeNull = document.getElementById(token.id);
      expect(shouldBeNull).toBeNull();

      view.create(token);
      assertDOMToken(token);
    });
  });

  describe("Token Redrawing", () => {
    test.each(mocking.token.getOneEach())("should be able to create $type", (token) => {
      view.create(token);
      token.x += 100;
      token.y += 100;
      token.w += 100;
      token.h += 100;
      token.r += 100;

      view.redraw(token);
      assertDOMToken(token);
    });
  });

  describe("Token Deletion", () => {
    test.each(mocking.token.getOneEach())("should remove $type from the DOM", (token) => {
      view.create(token);

      expect(document.getElementById(token.id)).not.toBeNull();

      view.remove([token.id]);

      expect(document.getElementById(token.id)).toBeNull();
    });
  });
});
