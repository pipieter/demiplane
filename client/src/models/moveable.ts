import Moveable from "moveable";

let instance: Moveable | null = null;

export function getMoveable() {
  if (instance) return instance;

  const container = document.getElementById("moveable") as unknown as HTMLElement;
  const objectsLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGElement;

  instance = new Moveable(container, {
    target: null,
    container: objectsLayer,
    draggable: true,
    resizable: true,
    scalable: true,
    rotatable: true,
    warpable: false,
    pinchable: false,
    origin: false,
    keepRatio: false,
    edge: false,
    throttleDrag: 0,
    throttleResize: 0,
    throttleScale: 0,
    throttleRotate: 0,
  });

  return instance;
}
