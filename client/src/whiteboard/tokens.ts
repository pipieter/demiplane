import type { Token } from "../token";
import whiteboard from "./whiteboard";

let all: Token[] = [];

function create(token: Token) {
  if (all.find((existing) => existing.id === token.id)) {
    throw `A token with id ${token.id} already exists!`;
  }

  all.push(token);
  whiteboard.create(token);
}

function remove(id: string) {
  all = all.filter((existing) => existing.id !== id);
  whiteboard.remove(id);
}

function transform(id: string, x: number, y: number, w: number, h: number) {
  const token = all.find((existing) => existing.id === id);

  if (!token) {
    throw `A token with id ${id} does not exists!`;
  }

  token.x = x;
  token.y = y;
  token.w = w;
  token.h = h;
  whiteboard.redraw(token);
}

const tokens = { create, transform, remove };
export default tokens;
