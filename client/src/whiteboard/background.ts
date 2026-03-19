import { server } from "../server";

const backgroundImage = document.getElementById("whiteboard-background-image") as unknown as SVGImageElement;

const layers = [
  document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement,
  document.getElementById("whiteboard-objects-layer") as unknown as SVGSVGElement,
  document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement,
  document.getElementById("whiteboard-resize") as unknown as SVGSVGElement,
];

function set(href: string | null, width: number, height: number) {
  if (href === null) {
    backgroundImage.removeAttribute("href");
  } else {
    backgroundImage.setAttribute("href", server.BackendURL + href);
  }

  backgroundImage.setAttribute("width", `${width}px`);
  backgroundImage.setAttribute("height", `${height}px`);
  for (const layer of layers) {
    layer.setAttribute("width", `${width}px`);
    layer.setAttribute("height", `${height}px`);
  }
}

const background = { set };
export default background;
