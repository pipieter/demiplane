import { TokenListener } from "../listeners";
import type { Token } from "../models/token";

class HoverView extends TokenListener {
  public readonly objects: SVGSVGElement;
  public readonly layer: SVGSVGElement;
  public readonly box: SVGRectElement;
  private hovered: Token | null;
  private observer: MutationObserver;

  constructor() {
    super();

    this.objects = document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement;
    this.layer = document.getElementById("whiteboard-hover") as unknown as SVGSVGElement;
    this.box = document.getElementById("hover-box") as unknown as SVGRectElement;
    this.hovered = null;
    this.observer = new MutationObserver((mutations, observer) => this.callback(mutations, observer));

    const config = { attributes: true, childList: true, subtree: true };
    this.observer.observe(this.objects, config);
  }

  public makeHoverable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;
    element.onmouseenter = () => {
      this.hovered = token;
      this.update();
    };
    element.onmouseleave = () => {
      this.hovered = null;
      this.update();
    };
  }

  private callback(_mutations: MutationRecord[], _observer: MutationObserver) {
    this.update(); // Bit overkill, but update every time something in the DOM changes
  }

  public update() {
    // Check if element still exists
    if (this.hovered && !document.getElementById(this.hovered.id)) {
      this.hovered = null;
    }

    if (!this.hovered) {
      this.layer.style.display = "none";
      return;
    }

    let angle = this.hovered.r;
    if (this.hovered.type === "line") angle = 0; // Don't rotate for line, it looks weird

    this.box.setAttribute("x", this.hovered.x.toString());
    this.box.setAttribute("y", this.hovered.y.toString());
    this.box.setAttribute("width", this.hovered.w.toString());
    this.box.setAttribute("height", this.hovered.h.toString());
    this.box.setAttribute("transform", `rotate(${angle} 0 0)`);
    this.layer.style.display = "";
  }
}

export default HoverView;
