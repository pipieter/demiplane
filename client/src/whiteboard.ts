import { movement } from "./whiteboard/transform/movement";
import { transform } from "./whiteboard/transform/transform";
import { server } from "./server";
import type { Token } from "./token";
import { resizebox } from "./whiteboard/transform/resizebox";

const backgroundLayer = document.getElementById("whiteboard-background-layer") as unknown as SVGElement;
const backgroundImage = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;
const objectsLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;
const drawingLayer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
const container = document.getElementById("whiteboard-container") as HTMLDivElement;
let selected: SVGElement[] = [];

function setBackground(href: string | null, width: number, height: number) {
  if (href === null) {
    backgroundImage.removeAttribute("href");
  } else {
    backgroundImage.setAttribute("href", server.BackendURL + href);
  }
  backgroundImage.setAttribute("width", `${width}px`);
  backgroundImage.setAttribute("height", `${height}px`);
  backgroundLayer.setAttribute("width", `${width}px`);
  backgroundLayer.setAttribute("height", `${height}px`);
  objectsLayer.setAttribute("width", `${width}px`);
  objectsLayer.setAttribute("height", `${height}px`);
  drawingLayer.setAttribute("width", `${width}px`);
  drawingLayer.setAttribute("height", `${height}px`);
  if (resizebox.layer) {
    resizebox.layer.setAttribute("width", `${width}px`);
    resizebox.layer.setAttribute("height", `${height}px`);
  }
}

function clearSelection() {
  for (const element of selected) {
    if (element.classList.contains("selected")) element.classList.remove("selected");
  }

  selected = [];
  resizebox.hide();
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
  resizebox.hide();

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
  transform.set(token.id, token.x, token.y, token.w, token.h);
}

export const whiteboard = {
  initialize,
  createToken,
  deleteToken,
  setBackground,
  container,
  clearSelection,
  addSelected,
  getSelected,
};
