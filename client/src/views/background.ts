import { server } from "../server";

class BackgroundView {
  public input: HTMLInputElement;
  public image: SVGImageElement;
  public layers: SVGSVGElement[];

  constructor() {
    this.input = document.getElementById("upload-background-button") as HTMLInputElement;
    this.image = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;
    this.layers = [
      document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement,
      document.getElementById("whiteboard-resize") as unknown as SVGSVGElement,
    ];
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

  public listen(_type: "background_upload", listener: (file: File) => void) {
    this.input.addEventListener("change", async (evt: Event) => {
      // @ts-expect-error Files should be a valid field
      const file = evt.target?.files[0];
      listener(file);
    });
  }
}

export default BackgroundView;
