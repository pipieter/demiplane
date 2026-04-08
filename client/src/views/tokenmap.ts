import type { Token } from "../models/token";
import server from "../server";

class TokenMapView {
  public readonly layer: SVGSVGElement;

  constructor() {
    this.layer = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;
  }

  public create(token: Token) {
    const tag = {
      circle: "ellipse",
      rectangle: "rect",
      image: "image",
      line: "line",
    }[token.type];

    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    element.setAttribute("id", token.id);
    element.setAttribute("tabindex", "-1"); // Makes object selectable
    element.classList.add("smooth-transform");
    this.layer.appendChild(element);
    this.draw(element, token);
  }

  public redraw(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement | null;

    if (!element) {
      throw `Cannot redraw token with id ${token.id} because it does not exist!`;
    }

    this.draw(element, token);
  }

  public remove(ids: string[]) {
    for (const id of ids) {
      document.getElementById(id)?.remove();
    }
  }

  private draw(element: SVGElement, token: Token) {
    switch (token.type) {
      case "circle": {
        const cx = token.x + token.w / 2;
        const cy = token.y + token.h / 2;
        let rx = token.w / 2;
        let ry = token.h / 2;

        if (token.border) {
          rx -= token.border / 2;
          ry -= token.border / 2;
          element.setAttribute("fill", "none");
          element.setAttribute("stroke", token.color);
          element.setAttribute("stroke-width", `${token.border}px`);
        } else {
          element.setAttribute("fill", token.color);
          element.setAttribute("stroke", "none");
        }

        element.setAttribute("rx", rx.toString());
        element.setAttribute("ry", ry.toString());
        element.setAttribute("transform", `translate(${cx} ${cy}) rotate(${token.r} ${cx} ${cy})`);
        break;
      }

      case "rectangle": {
        let x = token.x;
        let y = token.y;
        let w = token.w;
        let h = token.h;

        if (token.border) {
          x += token.border / 2;
          y += token.border / 2;
          w -= token.border;
          h -= token.border;
          element.setAttribute("fill", "none");
          element.setAttribute("stroke", token.color);
          element.setAttribute("stroke-width", `${token.border}px`);
        } else {
          element.setAttribute("fill", token.color);
          element.setAttribute("stroke", "none");
        }

        element.setAttribute("width", w.toString());
        element.setAttribute("height", h.toString());
        element.setAttribute("transform", `translate(${x} ${y}) rotate(${token.r} ${x} ${y})`);
        break;
      }

      case "line": {
        const x1 = token.x;
        const y1 = token.y;
        element.setAttribute("x1", "0");
        element.setAttribute("y1", "0");
        element.setAttribute("x2", token.w.toString());
        element.setAttribute("y2", token.h.toString());
        element.setAttribute("stroke-width", `${token.stroke}px`);
        element.setAttribute("stroke", token.color);
        element.setAttribute("transform", `translate(${x1} ${y1})`);
        break;
      }

      case "image": {
        const x = token.x;
        const y = token.y;
        element.setAttribute("href", server.fullURL(token.href));
        element.setAttribute("x", token.x.toString());
        element.setAttribute("y", token.y.toString());
        element.setAttribute("width", token.w.toString());
        element.setAttribute("height", token.h.toString());
        element.setAttribute("transform", `translate(${x} ${y}) rotate(${token.r} ${x} ${y})`);
      }
    }
  }

  public setlayer(token: Token, layer: number) {
    const children = [...this.layer.children];
    const element = document.getElementById(token.id) as Element;
    const index = children.indexOf(element);

    if (index < 0) return;

    children.splice(index, 1);
    children.splice(layer, 0, element);

    this.layer.replaceChildren(...children);
  }
}

export default TokenMapView;
