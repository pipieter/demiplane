import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TokenListView from "../../src/views/tokenlist";
import tokenMock from "../mocking";

describe("TokenListView", () => {
  let view: TokenListView;
  let emitSpy: Mock;
  const tokens = [tokenMock.getRect(), tokenMock.getCircle()];

  beforeEach(() => {
    view = new TokenListView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.list).toBeDefined();
      expect(view.checkbox).toBeDefined();
    });
  });

  describe("Visibility Toggle", () => {
    test("should show/hide the list based on checkbox state", () => {
      view.checkbox.checked = false;
      view.checkbox.dispatchEvent(new Event("change"));
      expect(view.list.style.display).toBe("none");

      view.checkbox.checked = true;
      view.checkbox.dispatchEvent(new Event("change"));
      expect(view.list.style.display).toBe("");
    });
  });

  describe("List Rendering", () => {
    test("should render tokens in reverse order", () => {
      view.update(tokens, []);

      const items = view.list.querySelectorAll("li");
      expect(items.length).toBe(tokens.length);

      // The last token in the array should be the first <li> in the DOM
      expect(items[0].id).toBe(`token-list-item-${tokens[1].id}`);
      expect(items[1].id).toBe(`token-list-item-${tokens[0].id}`);
    });

    test("should apply 'selected' class to active tokens", () => {
      view.update(tokens, [tokens[0]]);

      const firstItem = view.list.querySelector(`#token-list-item-${tokens[0].id}`);
      const secondItem = view.list.querySelector(`#token-list-item-${tokens[1].id}`);

      expect(firstItem?.classList.contains("selected")).toBe(true);
      expect(secondItem?.classList.contains("selected")).toBe(false);
    });
  });

  describe("Interactions", () => {
    test("should emit tokens_select when a list item is clicked", () => {
      view.update(tokens, []);
      const item = view.list.querySelector("li")!;

      item.click();

      expect(emitSpy).toHaveBeenCalledWith("tokens_select", [tokens[1]]);
    });
  });

  describe("Renaming Logic", () => {
    test("should emit token_transform on valid name change", () => {
      view.update([tokens[0]], []);
      const input = view.list.querySelector("input")!;

      input.value = "New Name";
      input.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith(
        "token_transform",
        expect.objectContaining({
          id: tokens[0].id,
          name: "New Name",
        }),
      );
    });

    test("should revert name if input is empty or too long", () => {
      const token = tokens[0];
      view.update([token], []);
      const input = view.list.querySelector("input")!;

      input.value = "   ";
      input.dispatchEvent(new Event("change"));

      expect(input.value).toBe(token.name);
      expect(emitSpy).not.toHaveBeenCalled();

      input.value = "this_is_a_very_long_name_that_exceeds_thirty_six_characters";
      input.dispatchEvent(new Event("change"));

      expect(input.value).toBe(token.name);
    });

    test("should blur input when Enter is pressed", () => {
      view.update([tokens[0]], []);
      const input = view.list.querySelector("input")!;
      const blurSpy = vi.spyOn(input, "blur");

      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

      expect(blurSpy).toHaveBeenCalled();
    });
  });
});
