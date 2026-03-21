import Listener from "../listener";
import { server } from "../server";
import View from "./view";

interface BackgroundViewMap {
  background_upload: File;
}

class BackgroundViewListeners extends Listener<BackgroundViewMap> {
  protected override keys(): (keyof BackgroundViewMap)[] {
    return ["background_upload"];
  }
}

class BackgroundView extends View<BackgroundViewListeners, BackgroundViewMap> {
  public input: HTMLInputElement;
  public image: SVGImageElement;
  public layers: SVGSVGElement[];

  constructor() {
    super(new BackgroundViewListeners());

    this.input = document.getElementById("upload-background-button") as HTMLInputElement;
    this.image = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;
    this.layers = [
      document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-resize") as unknown as SVGSVGElement,
    ];

    this.input.onchange = (evt) => {
      // @ts-expect-error Files should be a valid field
      const file = evt.target?.files[0];
      this.listeners.emit("background_upload", file);
    };
  }

  public set(href: string | null, width: number, height: number) {
    if (href === null) {
      this.image.removeAttribute("href");
    } else {
      this.image.setAttribute("href", server.BackendURL + href);
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
