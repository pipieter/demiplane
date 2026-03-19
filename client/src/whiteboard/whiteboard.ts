import type { Token } from "../token";
import { server } from "../server";
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
      {
        element.setAttribute("fill", token.color);
        const rx = token.w / 2;
        const ry = token.h / 2;
        token.x += rx;
        token.y += ry;
        element.setAttribute("rx", rx.toString());
        element.setAttribute("ry", ry.toString());
        break;
      }

    case "rectangle":
      element.setAttribute("fill", token.color);
      element.setAttribute("width", token.w.toString());
      element.setAttribute("height", token.h.toString());
      break;

    case "image":
      element.setAttribute("href", server.BackendURL + token.href);
      element.setAttribute("width", token.w.toString());
      element.setAttribute("height", token.h.toString());
  }

  const translate = `translate(${token.x} ${token.y})`;
  element.setAttribute("transform", translate);
}

const whiteboard = { create, remove, redraw };
export default whiteboard;
