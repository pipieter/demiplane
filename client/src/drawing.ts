import { getGridLockedCoordinate, setGridSize } from "./grid";
import socket from "./socket";
import type { Token } from "./token";

const container = document.getElementById("drawing") as unknown as SVGSVGElement;
const selectionBox = document.getElementById("drawing-selection-box") as unknown as SVGSVGElement;

let selected: SVGSVGElement | undefined;

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

  element.style.cursor = "pointer";
  element.addEventListener("click", () => select(token.id));

  collection.appendChild(element);
}

const drawing = { initialize, createToken, move };

export default drawing;
