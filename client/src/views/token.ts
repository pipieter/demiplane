import type { Token } from "../models/token";
import server from "../server";

class TokenView {
  private layer: SVGSVGElement;

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

        element.setAttribute("cx", cx.toString());
        element.setAttribute("cy", cy.toString());
        element.setAttribute("rx", rx.toString());
        element.setAttribute("ry", ry.toString());
        element.setAttribute("transform", `rotate(${token.r} 0 0)`);
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

        element.setAttribute("x", x.toString());
        element.setAttribute("y", y.toString());
        element.setAttribute("width", w.toString());
        element.setAttribute("height", h.toString());
        element.setAttribute("transform", `rotate(${token.r} 0 0)`);
        break;
      }

      case "line": {
        const x1 = token.x;
        const y1 = token.y;
        const x2 = token.x + token.w;
        const y2 = token.y + token.h;
        element.setAttribute("x1", x1.toString());
        element.setAttribute("y1", y1.toString());
        element.setAttribute("x2", x2.toString());
        element.setAttribute("y2", y2.toString());
        element.setAttribute("stroke-width", `${token.stroke}px`);
        element.setAttribute("stroke", token.color);
        element.setAttribute("transform", `rotate(${token.r} 0 0)`);
        break;
      }

      case "image":
        element.setAttribute("href", server.fullURL(token.href));
        element.setAttribute("x", token.x.toString());
        element.setAttribute("y", token.y.toString());
        element.setAttribute("width", token.w.toString());
        element.setAttribute("height", token.h.toString());
        element.setAttribute("transform", `rotate(${token.r} 0 0)`);
    }
  }
}

export default TokenView;
