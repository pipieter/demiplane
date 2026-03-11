import { getGridLockedCoordinate, setGridSize } from "./grid";
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
    element.setAttribute("cx", x.toString());
    element.setAttribute("cy", y.toString());
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
  setGridSize(64);
  background.onclick = unselect;
  container.onmousemove = (evt) => {
    const selectedId = selected?.getAttribute("id");
    const shift = evt.shiftKey;

    // Move the selected token if the left mouse button is down
    if ((evt.buttons & 1) !== 1) return;
    if (selectedId === null) return;

    // TODO find a cleaner way of doing this
    const x = shift ? getGridLockedCoordinate(evt.clientX) : evt.clientX;
    const y = shift ? getGridLockedCoordinate(evt.clientY) : evt.clientY;

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
    element.setAttribute("cx", token.x.toString());
    element.setAttribute("cy", token.y.toString());
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
