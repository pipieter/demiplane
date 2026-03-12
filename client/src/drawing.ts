import { getGridLockedCoordinates } from "./grid";
import socket, { BackendURL } from "./socket";
import type { Token } from "./token";

const container = document.getElementById("drawing") as unknown as SVGSVGElement;

let selected: SVGSVGElement | undefined;

function unselect() {
  selected = undefined;
}

function select(id: string) {
  if (selected && selected.id === id) return;
  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  selected = document.getElementById(id);
}

function move(id: string, x: number, y: number) {
  const element = document.getElementById(id) as unknown as SVGElement;

  if (element.tagName === "circle") {
    // A circle's cx and cy are the *center* coordinates, and need to be shifted using the radius
    const r = parseInt(element.getAttribute("r") ?? "0");
    element.setAttribute("cx", (x + r).toString());
    element.setAttribute("cy", (y + r).toString());
  } else {
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
  }
}

function getObjectsCollection(): SVGSVGElement {
  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  return document.getElementById("drawing-objects");
}

function initialize() {
  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  const background = document.getElementById("drawing-background") as SVGSVGElement;
  background.onclick = unselect;
  container.onmousemove = (evt) => {
    const selectedId = selected?.getAttribute("id");
    const shift = evt.shiftKey;

    // Move the selected token if the left mouse button is down
    if ((evt.buttons & 1) !== 1) return;
    if (selectedId === null) return;

    const { x, y } = shift ? getGridLockedCoordinates(evt.offsetX, evt.offsetY) : { x: evt.offsetX, y: evt.offsetY };

    socket.send(
      JSON.stringify({
        type: "request_move",
        move: {
          id: selectedId,
          x,
          y,
        },
      }),
    );
  };
}

function createToken(token: Token) {
  const collection = getObjectsCollection();

  let element: SVGElement;

  if (token.type === "circle") {
    element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    element.setAttribute("id", token.id);
    element.setAttribute("fill", token.color);
    // A circle's cx and cy are the *center* coordinates, and need to be shifted using the radius
    element.setAttribute("cx", (token.x + token.r).toString());
    element.setAttribute("cy", (token.y + token.r).toString());
    element.setAttribute("r", token.r.toString());
    element.setAttribute("tabindex", "-1"); // Makes object selectable
  } else if (token.type === "image") {
    const href = BackendURL + token.href;
    element = document.createElementNS("http://www.w3.org/2000/svg", "image");
    element.setAttribute("id", token.id);
    element.setAttribute("href", href);
    element.setAttribute("x", token.x.toString());
    element.setAttribute("y", token.y.toString());
    element.setAttribute("width", token.w.toString());
    element.setAttribute("height", token.h.toString());
  } else {
    throw `Unsupported token data ${JSON.stringify(token)}`;
  }

  element.addEventListener("click", () => select(token.id));
  element.addEventListener("focus", () => select(token.id));

  collection.appendChild(element);
}

const drawing = { initialize, createToken, move };

export default drawing;
