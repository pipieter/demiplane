import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import State from "../src/state";
import { mockUser, tokenMock } from "./mocking";
import { Transform } from "../src/models/transform";

describe("State Class", () => {
  let state: State;

  let tokenCreate: Mock;
  let tokenDelete: Mock;
  let tokenSelect: Mock;
  let tokenTransform: Mock;
  let userDisconnect: Mock;
  let gridChange: Mock;
  let backgroundChange: Mock;

  beforeEach(() => {
    state = new State();

    tokenCreate = vi.fn();
    tokenDelete = vi.fn();
    tokenSelect = vi.fn();
    tokenTransform = vi.fn();
    userDisconnect = vi.fn();
    gridChange = vi.fn();
    backgroundChange = vi.fn();
    state.listen("token_create", tokenCreate);
    state.listen("token_delete", tokenDelete);
    state.listen("token_select", tokenSelect);
    state.listen("token_transform", tokenTransform);
    state.listen("user_disconnect", userDisconnect);
    state.listen("grid_change", gridChange);
    state.listen("background_change", backgroundChange);

  });

  describe("Token Management", () => {
    test("Should add token and emit token_create", () => {
      const token = tokenMock.getRect();

      state.createToken(token);

      expect(state.getTokens()).toContain(token);
      expect(tokenCreate).toHaveBeenCalledWith(token);
    });

    test("Should remove tokens and emit token_delete and token_select", () => {
      const token1 = tokenMock.getCircle();
      const token2 = tokenMock.getLine();
      state.createTokens([token1, token2]);
      state.selectTokens([token1]);

      state.removeTokens(token1.id);

      expect(state.getTokens()).not.toContain(token1);
      expect(tokenDelete).toHaveBeenCalledWith([token1.id]);
      expect(tokenSelect).toHaveBeenCalledWith([[token1], []]);
    });

    test("Should transform a token and emit token_transform", () => {
      const token = tokenMock.getImage();
      state.createToken(token);

      const transform: Transform = {
        id: token.id,
        name: "Edited Name",
        x: token.x + 10,
        y: token.y + 20,
        w: token.w + 30,
        h: token.h + 40,
        r: token.r + 50,
      };

      state.transformToken(transform);

      const updatedToken = state.getTokens()[0];
      expect(tokenTransform).toHaveBeenCalledWith([token, transform]);
      expect(updatedToken.name).toBe(transform.name);
      expect(updatedToken.x).toBe(transform.x);
      expect(updatedToken.y).toBe(transform.y);
      expect(updatedToken.w).toBe(transform.w);
      expect(updatedToken.h).toBe(transform.h);
      expect(updatedToken.r).toBe(transform.r);
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

      state.removeUser(user.id);

      expect(userDisconnect).toHaveBeenCalledWith(user.id);
    });
  });

  describe("Grid and Background", () => {
    test("should update grid and emit grid_change", () => {
      const gridData = { size: 50, offset: { x: 10, y: 10 } };

      state.setGrid(gridData);

      expect(state.grid.size).toBe(50);
      expect(gridChange).toHaveBeenCalled();
    });

    test("should update background and emit background_change", () => {
      state.setBackground("https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1000", 1000, 1000);

      expect(backgroundChange).toHaveBeenCalled();
    });
  });
});
