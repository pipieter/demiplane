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
    const layerIds = [
      "whiteboard-background-layer",
      "whiteboard-objects-layer",
      "whiteboard-drawing-layer",
      "user-cursors-container",
      "moveable",
    ];
    this.layers = layerIds.map((id) => document.getElementById(id) as unknown as SVGSVGElement);

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
