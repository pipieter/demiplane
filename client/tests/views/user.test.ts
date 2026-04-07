import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import UserView from "../../src/views/user";
import mocking from "../mocking";

describe("UserView", () => {
  let view: UserView;
  let emitSpy: Mock;

  beforeEach(() => {
    view = new UserView();
    emitSpy = vi.spyOn(view, "emit");
  });

  describe("Initialization", () => {
    test("should find all required DOM elements", () => {
      expect(view.nameInput).toBeDefined();
      expect(view.colorInput).toBeDefined();
      expect(view.userList).toBeDefined();
    });
  });

  describe("Input Handling", () => {
    test("should emit user_change when name is updated", () => {
      view.nameInput.value = "New Name";
      view.nameInput.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("user_change", {
        name: "New Name",
        color: view.colorInput.value,
      });
    });

    test("should emit user_change when color is updated", () => {
      view.colorInput.value = "#ff0000";
      view.colorInput.dispatchEvent(new Event("change"));

      expect(emitSpy).toHaveBeenCalledWith("user_change", {
        name: view.nameInput.value,
        color: "#ff0000",
      });
    });
  });

  describe("setMe() method", () => {
    test("should update inputs and CSS variable", () => {
      const me = mocking.user.getUser({ color: "#ffffff" });
      view.setMe(me);

      expect(view.nameInput.value).toBe(me.name);
      expect(view.colorInput.value).toBe(me.color);
      expect(document.documentElement.style.getPropertyValue("--user-color")).toBe(me.color);
    });
  });

  describe("set() method (User List)", () => {
    const color = "#ff00ff";
    const rgb = "rgb(255, 0, 255)"; //JSDOM returns RGB instead of hex on some elements.
    const user = mocking.user.getUser({ color });

    test("should create a new list item if it doesn't exist", () => {
      view.set(user);

      const li = document.getElementById(`user-${user.id}`);
      expect(li).not.toBeNull();
      expect(li?.querySelector("p")?.innerText).toBe(user.name);
      expect(li?.style.color).toBe(rgb);
    });

    test("should update existing list item instead of duplicating", () => {
      view.set(user);
      const name = "New Name";
      view.set({ ...user, name });

      const items = document.querySelectorAll("#user-list li");
      expect(items.length).toBe(1);
      expect(items[0].querySelector("p")?.innerText).toBe(name);
    });

    test("should apply special styling if isMe is true", () => {
      view.set(user, true);
      const li = document.getElementById(`user-${user.id}`);
      expect(li?.style.backgroundColor).toBeDefined();
    });
  });

  describe("delete() method", () => {
    test("should remove the user from the list", () => {
      const user = mocking.user.getUser();
      view.set(user);
      expect(document.getElementById(`user-${user.id}`)).not.toBeNull();

      view.delete(user.id);
      expect(document.getElementById(`user-${user.id}`)).toBeNull();
    });
  });
});
