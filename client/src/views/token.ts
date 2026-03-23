import { Listener, ListenerContainer } from "../listener";
import type { Token } from "../models/token";
import server from "../server";

interface TokenViewMap {
  request_remove: null;
}

class TokenViewListener extends Listener<TokenViewMap> {
  protected override keys(): (keyof TokenViewMap)[] {
    return ["request_remove"];
  }
}

class TokenView extends ListenerContainer<TokenViewListener, TokenViewMap> {
  private layer: SVGSVGElement;

  constructor() {
    super(new TokenViewListener());

    this.layer = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;

    window.addEventListener("keydown", (event) => {
      const keys = ["Delete", "Backspace"];
      if (keys.includes(event.key)) {
        this.emit("request_remove", null);
      }
    });
  }

  public create(token: Token) {
    const tag = {
      circle: "ellipse",
      rectangle: "rect",
      image: "image",
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
      case "circle":
        let cx = token.x + token.w / 2;
        let cy = token.y + token.h / 2;
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

        console.log(cx, cy, rx, ry);

        element.setAttribute("cx", cx.toString());
        element.setAttribute("cy", cy.toString());
        element.setAttribute("rx", rx.toString());
        element.setAttribute("ry", ry.toString());
        break;

      case "rectangle":
        element.setAttribute("fill", token.color);
        element.setAttribute("x", token.x.toString());
        element.setAttribute("y", token.y.toString());
        element.setAttribute("width", token.w.toString());
        element.setAttribute("height", token.h.toString());
        break;

      case "image":
        element.setAttribute("href", server.url + token.href);
        element.setAttribute("x", token.x.toString());
        element.setAttribute("y", token.y.toString());
        element.setAttribute("width", token.w.toString());
        element.setAttribute("height", token.h.toString());
    }
  }
}

export default TokenView;
