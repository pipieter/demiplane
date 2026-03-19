import type { Token } from "../token";
import { transform } from "./transform/transform";

const objectLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;

function create(token: Token) {
  if (document.getElementById(token.id)) {
    throw `Cannot create a token with id ${token.id} because it already exists!`;
  }

  const elementType = {
    circle: "ellipse",
    rectangle: "rect",
    image: "image",
  }[token.type];

  const element = document.createElementNS("http://www.w3.org/2000/svg", elementType);
  element.setAttribute("id", token.id);
  element.setAttribute("tabindex", "-1"); // Makes object selectable
  transform.makeDraggable(element);
  objectLayer.appendChild(element);
  draw(element, token);
}

function remove(id: string) {
  objectLayer.getElementById(id)?.remove();
}

function redraw(token: Token) {
  const element = document.getElementById(token.id) as unknown as SVGElement | null;

  if (!element) {
    throw `Cannot redraw token with id ${token.id} because it does not exist!`;
  }

  draw(element, token);
}

function draw(element: SVGElement, token: Token) {
  switch (token.type) {
    case "circle":
      element.setAttribute("fill", token.color);
      element.setAttribute("cx", (token.x + token.w / 2).toString());
      element.setAttribute("cy", (token.y + token.h / 2).toString());
      element.setAttribute("rx", (token.w / 2).toString());
      element.setAttribute("ry", (token.h / 2).toString());
      break;

    case "rectangle":
      element.setAttribute("fill", token.color);
      element.setAttribute("x", token.x.toString());
      element.setAttribute("y", token.y.toString());
      element.setAttribute("width", token.w.toString());
      element.setAttribute("height", token.h.toString());
      break;

    case "image":
      element.setAttribute("href", token.href);
      element.setAttribute("x", token.x.toString());
      element.setAttribute("y", token.y.toString());
      element.setAttribute("width", token.w.toString());
      element.setAttribute("height", token.h.toString());
  }
}

const whiteboard = { create, remove, redraw };
export default whiteboard;
