import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import TokenEditView from "../../src/views/tokenedit";
import mocking from "../mocking";

describe("TokenEditView", () => {
  let view: TokenEditView;
  let emitSpy: Mock;
  const tokens = mocking.token.getOneEach();

  beforeEach(() => {
    view = new TokenEditView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.editX).toBeDefined();
      expect(view.editY).toBeDefined();
      expect(view.editW).toBeDefined();
      expect(view.editH).toBeDefined();
      expect(view.editR).toBeDefined();
      expect(view.editElements.length).toBe(5);
      expect(view.deleteButton).toBeDefined();
    });
  });

  describe("Selection Logic", () => {
    test.each(tokens)("should enable inputs and set values when $type token is selected", (token) => {
      view.select([token]);

      for (const edit of view.editElements) expect(edit.disabled).toBe(false);
      expect(view.deleteButton.disabled).toBe(false);

      expect(parseFloat(view.editX.value)).toBeCloseTo(token.x);
      expect(parseFloat(view.editY.value)).toBeCloseTo(token.y);
      expect(parseFloat(view.editW.value)).toBeCloseTo(token.w);
      expect(parseFloat(view.editH.value)).toBeCloseTo(token.h);
      expect(parseFloat(view.editR.value)).toBeCloseTo(token.r);
    });

    test("should disable inputs if multiple tokens are selected", () => {
      view.select([tokens[0], tokens[1]]);
      for (const edit of view.editElements) expect(edit.disabled).toBe(true);
      expect(view.deleteButton.disabled).toBe(true);
    });

    test("should disable inputs if no tokens are selected", () => {
      view.select([]);
      for (const edit of view.editElements) expect(edit.disabled).toBe(true);
      expect(view.deleteButton.disabled).toBe(true);
    });
  });

  describe("Live Updates", () => {
    test("should update input values when a matching transform is received", () => {
      const target = tokens[0];
      view.select([target]);

      view.update({
        id: target.id,
        name: target.name,
        x: 500,
        y: 600,
        w: 100,
        h: 100,
        r: 45,
      });

      expect(view.editX.value).toBe("500");
      expect(view.editY.value).toBe("600");
    });

    test("should NOT update values if the transform ID doesn't match the selected token", () => {
      view.select([tokens[0]]);
      const originalValue = view.editX.value;

      view.update({
        id: "some-other-id",
        name: "wrong name",
        x: 999,
        y: 999,
        w: 1,
        h: 1,
        r: 0,
      });

      expect(view.editX.value).toBe(originalValue);
    });

    describe("Events and Sanitization", () => {
      test("should emit token_transform when an input is changed", () => {
        const target = tokens[0];
        view.select([target]);

        view.editX.value = "250";
        view.editX.dispatchEvent(new Event("change"));

        expect(emitSpy).toHaveBeenCalledWith(
          "token_transform",
          expect.objectContaining({
            id: target.id,
            x: 250,
          }),
        );
      });

      test("should emit tokens_delete when delete button is clicked", () => {
        const target = tokens[0];
        view.select([target]);

        view.deleteButton.click();

        expect(emitSpy).toHaveBeenCalledWith("tokens_delete", [target]);
      });
    });
  });
});
