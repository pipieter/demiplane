import { Listener } from "../listener";
import server from "../server";

interface BackgroundViewMap {
  background_upload: File;
}

class BackgroundView extends Listener<BackgroundViewMap> {
  public readonly input: HTMLInputElement;
  public readonly image: SVGImageElement;
  public readonly layers: SVGSVGElement[];

  constructor() {
    super();

    this.input = document.getElementById("upload-background-button") as HTMLInputElement;
    this.image = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;
    this.layers = [
      document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-resize") as unknown as SVGSVGElement,
      document.getElementById("user-cursors-container") as unknown as SVGSVGElement,
      document.getElementById("ruler-layer") as unknown as SVGSVGElement,
    ];

    this.input.onchange = (evt) => {
      const file = (evt.target as HTMLInputElement).files?.item(0);
      if (file) {
        this.emit("background_upload", file);
      }
    };
  }

  public set(href: string | null, width: number, height: number) {
    if (href === null) {
      this.image.removeAttribute("href");
    } else {
      this.image.setAttribute("href", server.fullURL(href));
    }

    this.image.setAttribute("width", `${width}px`);
    this.image.setAttribute("height", `${height}px`);
    for (const layer of this.layers) {
      layer.setAttribute("width", `${width}px`);
      layer.setAttribute("height", `${height}px`);
    }
  }
}

export default BackgroundView;
