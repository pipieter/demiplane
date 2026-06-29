import Moveable from "moveable";

const container = document.getElementById("moveable") as HTMLDivElement;
const objectsLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGElement;

export const moveable = new Moveable(container, {
  target: null,
  container: objectsLayer,
  draggable: true,
  resizable: false, // Resize is not supported with SVG.
  scalable: false, // TODO
  rotatable: true,
  warpable: false,
  pinchable: false, // TODO
  origin: true,
  keepRatio: true,
  edge: false,
  throttleDrag: 0,
  throttleResize: 0,
  throttleScale: 0,
  throttleRotate: 0,
});
