import { makeElementDraggable } from "./movement";
import { BackendURL } from "./socket";
import type { Token } from "./token";

export const background = document.getElementById("drawing-background") as unknown as SVGElement;
export const backgroundImage = document.getElementById("drawing-background-image") as unknown as SVGImageElement;
export const container = document.getElementById("drawing-container")!;
export const drawingObjects = document.getElementById("drawing-objects") as unknown as SVGSVGElement;
export const contents = document.getElementById("drawing") as unknown as SVGSVGElement;
export let selected: SVGElement[] = [];

function setBackground(href: string, width: number, height: number) {
  backgroundImage.setAttribute("href", href);
  backgroundImage.setAttribute("width", `${width}px`);
  backgroundImage.setAttribute("height", `${height}px`);
  background.setAttribute("width", `${width}px`);
  background.setAttribute("height", `${height}px`);
  drawingObjects.setAttribute("width", `${width}px`);
  drawingObjects.setAttribute("height", `${height}px`);
}

export function clearSelection() {
  for (const element of selected) {
    if (element.classList.contains("selected")) element.classList.remove("selected");
  }
  selected = [];
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
  background.onclick = clearSelection;
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
  } else if (token.type === "rectangle") {
    element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    element.setAttribute("id", token.id);
    element.setAttribute("fill", token.color);
    element.setAttribute("x", token.x.toString());
    element.setAttribute("y", token.y.toString());
    element.setAttribute("width", token.w.toString());
    element.setAttribute("height", token.h.toString());
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

  makeElementDraggable(element);
  collection.appendChild(element);
}

export const drawing = { initialize, createToken, move, setBackground };
