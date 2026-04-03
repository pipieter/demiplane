import { beforeEach, describe, expect, Mock, test, vi } from "vitest";
import State, { StateListenerMap } from "../src/state";
import { mockUser, tokenMock } from "./mocking";
import { Transform } from "../src/models/transform";

describe("State Class", () => {
  let state: State;
  let spies: { [K in keyof StateListenerMap]: Mock };

  beforeEach(() => {
    state = new State();

    const eventNames: (keyof StateListenerMap)[] = [
      "background_change",
      "grid_change",
      "user_change",
      "user_disconnect",
      "token_create",
      "token_select",
      "token_transform",
      "token_delete",
    ];

    spies = eventNames.reduce(
      (acc, key) => {
        acc[key] = vi.fn();
        state.listen(key, acc[key]);
        return acc;
      },
      {} as { [K in keyof StateListenerMap]: Mock },
    );
  });

  describe("Token Management", () => {
    test("Should add token and emit token_create", () => {
      const token = tokenMock.getRect();

      state.createToken(token);

      expect(state.getTokens()).toContain(token);
      expect(spies["token_create"]).toHaveBeenCalledWith(token);
    });

    test("Should remove tokens and emit token_delete and token_select", () => {
      const token1 = tokenMock.getCircle();
      const token2 = tokenMock.getLine();
      state.createTokens([token1, token2]);
      state.selectTokens([token1]);

      state.removeTokens(token1.id);

      expect(state.getTokens()).not.toContain(token1);
      expect(spies["token_delete"]).toHaveBeenCalledWith([token1.id]);
      expect(spies["token_select"]).toHaveBeenCalledWith([[token1], []]);
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
      expect(spies["token_transform"]).toHaveBeenCalledWith([token, transform]);
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

      expect(spies["user_disconnect"]).toHaveBeenCalledWith(user.id);
    });
  });

  describe("Grid and Background", () => {
    test("should update grid and emit grid_change", () => {
      const gridData = { size: 50, offset: { x: 10, y: 10 } };

      state.setGrid(gridData);

      expect(state.grid.size).toBe(50);
      expect(spies["grid_change"]).toHaveBeenCalled();
    });

    test("should update background and emit background_change", () => {
      state.setBackground("https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1000", 1000, 1000);

      expect(spies["background_change"]).toHaveBeenCalled();
    });
  });
});
