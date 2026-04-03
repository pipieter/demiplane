import { beforeEach, describe, expect, test, vi } from "vitest";
import State from "../src/state";
import { mockUser, tokenMock } from "./mocking";

describe("State Class", () => {
  let state: State;

  beforeEach(() => {
    state = new State();
  });

  describe("Token Management", () => {
    test("Should add token and emit token_create", () => {
      const token = tokenMock.getRect();
      const spy = vi.fn();

      state.listen("token_create", spy);
      state.createToken(token);

      expect(state.getTokens()).toContain(token);
      expect(spy).toHaveBeenCalledWith(token);
    });

    test("Should remove tokens and emit token_delete and token_select", () => {
      const token1 = tokenMock.getCircle();
      const token2 = tokenMock.getLine();
      state.createTokens([token1, token2]);
      state.selectTokens([token1]);

      const deleteSpy = vi.fn();
      const selectSpy = vi.fn();

      state.listen("token_delete", deleteSpy);
      state.listen("token_select", selectSpy);

      state.removeTokens(token1.id);

      expect(state.getTokens()).not.toContain(token1);
      expect(deleteSpy).toHaveBeenCalledWith([token1.id]);
      expect(selectSpy).toHaveBeenCalledWith([[token1], []]);
    });
  });

  describe("User Management", () => {
    test("Should set me and track the user correctly", () => {
      const me = mockUser.getUser();
      state.setMe(me);

      expect(state.getMe()).toEqual(me);
      expect(state.isMe(me)).toBe(true);
    });

    test("should emit user_disconnect when a user is removed", () => {
      const user = mockUser.getUser();
      state.setUser(user);

      const spy = vi.fn();
      state.listen("user_disconnect", spy);

      state.removeUser(user.id);

      expect(spy).toHaveBeenCalledWith(user.id);
    });
  });

  describe("Grid and Background", () => {
    test("should update grid and emit grid_change", () => {
      const gridData = { size: 50, offset: { x: 10, y: 10 } };
      const spy = vi.fn();

      state.listen("grid_change", spy);
      state.setGrid(gridData);

      expect(state.grid.size).toBe(50);
      expect(spy).toHaveBeenCalled();
    });

    test("should update background and emit background_change", () => {
      const spy = vi.fn();
      state.listen("background_change", spy);

      state.setBackground("https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1000", 1000, 1000);

      expect(spy).toHaveBeenCalled();
    });
  });
});
