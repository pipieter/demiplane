import server from "../server";

class BackgroundView {
  public readonly image: SVGImageElement;
  public readonly whiteboardLayers: SVGSVGElement[];

  constructor() {
    this.image = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;
    this.whiteboardLayers = [
      document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-resize") as unknown as SVGSVGElement,
      document.getElementById("user-cursors-container") as unknown as SVGSVGElement,
    ];
  }

  public set(href: string | null, width: number, height: number) {
    if (href === null) {
      this.image.removeAttribute("href");
    } else {
      this.image.setAttribute("href", server.fullURL(href));
    }

    this.image.setAttribute("width", `${width}px`);
    this.image.setAttribute("height", `${height}px`);
    for (const layer of this.whiteboardLayers) {
      layer.setAttribute("width", `${width}px`);
      layer.setAttribute("height", `${height}px`);
    }
  }
}

export default BackgroundView;
