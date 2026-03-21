import Listeners from "../listener";
import type { Token } from "../models/token";
import { server } from "../server";

interface TokenViewListenerMap {
  request_remove: null;
}

class TokenViewListener extends Listeners<TokenViewListenerMap> {
  protected override keys(): (keyof TokenViewListenerMap)[] {
    return ["request_remove"];
  }
}

class TokenView {
  private layer: SVGSVGElement;
  private listeners: TokenViewListener;

  constructor() {
    this.layer = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;
    this.listeners = new TokenViewListener();

    window.addEventListener("keydown", (event) => {
      const keys = ["Delete", "Backspace"];
      if (keys.includes(event.key)) {
        this.listeners.emit("request_remove", null);
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
        element.setAttribute("href", server.BackendURL + token.href);
        element.setAttribute("x", token.x.toString());
        element.setAttribute("y", token.y.toString());
        element.setAttribute("width", token.w.toString());
        element.setAttribute("height", token.h.toString());
    }
  }

  public listen<K extends keyof TokenViewListenerMap>(type: K, listener: (value: TokenViewListenerMap[K]) => void) {
    this.listeners.listen(type, listener);
  }
}

export default TokenView;
