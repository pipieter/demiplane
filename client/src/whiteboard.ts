import { movement } from "./whiteboard/movement";
import { transform } from "./whiteboard/transform";
import { server } from "./server";
import type { Token } from "./token";

const container = document.getElementById("whiteboard-container") as HTMLDivElement;
let selected: SVGElement[] = [];

function clearSelection() {
  for (const element of selected) {
    if (element.classList.contains("selected")) element.classList.remove("selected");
  }

  selected = [];
  transform.hideBox();
}

function addSelected(element: SVGElement) {
  selected.push(element);
}

function getSelected(): SVGElement[] {
  return selected;
}

function getObjectsCollection(): SVGSVGElement {
  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  return document.getElementById("whiteboard-objects-layer");
}

function initialize() {
  // @ts-expect-error document.getElementById's typing returns an HTML element, but an SVGSVGElement is queried
  const background = document.getElementById("whiteboard-background-layer") as SVGSVGElement;
  background.onclick = clearSelection;

  window.addEventListener("keydown", (event) => {
    if (event.key === "Delete") sendDeleteRequest();
    if (event.key === "Backspace") sendDeleteRequest();
  });
}

function sendDeleteRequest() {
  if (selected.length <= 0) return;

  const tokenIds: string[] = [];
  for (const token of selected) {
    const id = token.getAttribute("id");
    if (id) tokenIds.push(id);
  }

  clearSelection();
  transform.hideBox();

  server.send({
    type: "request_delete",
    delete: tokenIds,
  });
}

function deleteToken(id: string) {
  const element = document.getElementById(id);
  if (element) element?.remove();
}

function createToken(token: Token) {
  const collection = getObjectsCollection();

  let element: SVGElement;

  if (token.type === "circle") {
    element = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    element.setAttribute("fill", token.color);
  } else if (token.type === "rectangle") {
    element = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    element.setAttribute("fill", token.color);
  } else if (token.type === "image") {
    const href = server.BackendURL + token.href;
    element = document.createElementNS("http://www.w3.org/2000/svg", "image");
    element.setAttribute("href", href);
  } else {
    throw `Unsupported token data ${JSON.stringify(token)}`;
  }

  element.setAttribute("id", token.id);
  element.setAttribute("tabindex", "-1"); // Makes object selectable
  movement.makeDraggable(element);

  collection.appendChild(element);
  transform.setTransform(token.id, token.x, token.y, token.w, token.h);
}

export const whiteboard = {
  initialize,
  createToken,
  deleteToken,
  container,
  clearSelection,
  addSelected,
  getSelected,
};
