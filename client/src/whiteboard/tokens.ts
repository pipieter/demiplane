import { server } from "../server";
import type { Token } from "../token";
import selection from "./selection";
import { resizebox } from "./transform/resizebox";
import whiteboard from "./whiteboard";

let all: Token[] = [];

function initialize() {
  function sendRemovalRequest() {
    const ids = selection.get();
    if (ids.length <= 0) return;

    selection.clear();
    resizebox.hide();

    server.send({
      type: "request_delete",
      delete: ids,
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Delete") sendRemovalRequest();
    if (event.key === "Backspace") sendRemovalRequest();
  });
}

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

const tokens = { create, transform, remove, initialize };
export default tokens;
