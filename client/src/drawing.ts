import { setGridSize } from "./grid";
import socket from "./socket";
import type { Token } from "./token";

let selected: SVGSVGElement | undefined;

// @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
const selectionBox: SVGSVGElement = document.getElementById("drawing-selection-box");

function unselect() {
  selected = undefined;
  updateSelectionBox();
}

function select(id: string) {
  // If selecting the same object again, toggle its selection instead
  // and de-select it
  if (selected && selected.id === id) {
    unselect();
    return;
  }

  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  selected = document.getElementById(id);
  updateSelectionBox();
}

function updateSelectionBox() {
  if (!selected) {
    selectionBox.setAttribute("stroke-width", "0");
    return;
  }

  const box = selected.getBBox();
  selectionBox.setAttribute("x", box.x.toString());
  selectionBox.setAttribute("y", box.y.toString());
  selectionBox.setAttribute("width", box.width.toString());
  selectionBox.setAttribute("height", box.height.toString());
  selectionBox.setAttribute("stroke-width", "5");
}

function move(id: string, x: number, y: number) {
  const element = document.getElementById(id) as unknown as SVGSVGElement;
  element.setAttribute("cx", x.toString());
  element.setAttribute("cy", y.toString());
  updateSelectionBox();
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
}

function createToken(token: Token) {
  const collection = getObjectsCollection();

  let element: SVGSVGElement;

  if (token.type === "circle") {
    // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
    element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    element.setAttribute("id", token.id);
    element.setAttribute("fill", token.color);
    element.setAttribute("cx", token.x.toString());
    element.setAttribute("cy", token.y.toString());
    element.setAttribute("r", token.r.toString());
  } else {
    throw `Unsupported token type: ${token.type}`;
  }
  // For now, assume only circles are created
  element.style.cursor = "pointer";
  element.onclick = () => select(token.id);
  element.onmousemove = (evt: MouseEvent) => {
    // Only allow move if the item is selected
    if (selected?.getAttribute("id") !== token.id) return;

    // Only allow move if the left mouse button was pressed
    if ((evt.buttons & 1) !== 1) return;

    // TODO find a cleaner way of doing this
    const x = evt.clientX;
    const y = evt.clientY;

    socket.send(
      JSON.stringify({
        type: "request_move",
        move: {
          id: token.id,
          x,
          y,
        },
      }),
    );
  };

  collection.appendChild(element);
}

const drawing = { initialize, createToken, move };

export default drawing;
