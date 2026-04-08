import { beforeEach, describe, expect, test } from "vitest";
import UserCursorsView from "../../src/views/usercursors";
import mocking from "../mocking";
import { User } from "../../src/models/user";

describe("UserCursorView", () => {
  let view: UserCursorsView;
  let user: User;

  beforeEach(() => {
    view = new UserCursorsView();
    user = mocking.user.getUser();
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.layer).toBeDefined();
    });
  });

  describe("Rendering", () => {
    test("should create user cursor", () => {
      view.renderUserCursor(user);

      const cursor = document.getElementById(`cursor-${user.id}`);
      expect(cursor).not.toBeNull();
    });

    test("should adjust existing cursor's styling", () => {
      user.cursorPosition = { x: 100, y: 150 };
      view.renderUserCursor(user);

      user.color = "#000000";
      user.cursorPosition.x += 100;
      user.cursorPosition.y += 200;

      view.renderUserCursor(user);

      const cursor = document.getElementById(`cursor-${user.id}`);
      expect(cursor).not.toBeNull();
      expect(cursor?.style.opacity).not.toBe("0");
      expect(cursor?.style.color).toBe("rgb(0, 0, 0)");
      expect(cursor?.style.transform).toBe(`translate(${user.cursorPosition.x}px, ${user.cursorPosition.y}px)`);
    });

    test("should hide cursor if position is null", () => {
      user.cursorPosition = null;
      view.renderUserCursor(user);

      const cursor = document.getElementById(`cursor-${user.id}`);
      expect(cursor).not.toBeNull();
      expect(cursor?.style.opacity).toBe("0");
    });
  });
});
