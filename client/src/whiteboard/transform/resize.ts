import { grid } from "../grid";
import { server } from "../../server";
import { viewport } from "../viewport";
import selection from "../selection";
import { resizebox } from "./resizebox";

let cursorStartPosition = { x: 0, y: 0 };
let elementStartSize: DOMRect = new DOMRect(0, 0, 0, 0);
let direction: string | null = null;

function start(e: MouseEvent) {
  e.stopPropagation();
  const target = e.target as SVGElement;
  direction = target.dataset.dir ?? null;

  const element = selection.elements()[0];

  cursorStartPosition = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  elementStartSize = element.getBBox();
  document.addEventListener("mousemove", send);
  document.addEventListener("mouseup", stop);
}

function stop() {
  document.removeEventListener("mousemove", send);
  document.removeEventListener("mouseup", stop);
  direction = null;
}

function send(e: MouseEvent, minSize: number = 8) {
  const elements = selection.elements();

  if (elements.length <= 0 || !direction) return;
  const box = elements[0].getBBox();
  resizebox.show(elements[0]);

  let x = box.x;
  let y = box.y;
  let width = box.width;
  let height = box.height;

  const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);

  const dx = current.x - cursorStartPosition.x;
  const dy = current.y - cursorStartPosition.y;

  switch (direction) {
    case "br":
      width = elementStartSize.width + dx;
      height = elementStartSize.height + dy;
      break;

    case "tr":
      width = elementStartSize.width + dx;
      height = elementStartSize.height - dy;
      y = elementStartSize.y + (elementStartSize.height - height);
      break;

    case "bl":
      width = elementStartSize.width - dx;
      height = elementStartSize.height + dy;
      x = elementStartSize.x + (elementStartSize.width - width);
      break;

    case "tl":
      width = elementStartSize.width - dx;
      height = elementStartSize.height - dy;
      x = elementStartSize.x + (elementStartSize.width - width);
      y = elementStartSize.y + (elementStartSize.height - height);
      break;
  }

  if (e.shiftKey) {
    function getSnapStep(size: number, gridSize: number, minSize: number) {
      let step = gridSize;

      while (step / 2 >= minSize && size < step) {
        if (size <= minSize) break;
        step /= 2;
      }

      return step;
    }

    function snapToStep(value: number, offset: number, step: number) {
      return Math.round((value - offset) / step) * step + offset;
    }

    const stepX = getSnapStep(width, grid.get().size, minSize);
    const stepY = getSnapStep(height, grid.get().size, minSize);

    if (direction.includes("r")) {
      const snappedX = snapToStep(x + width, grid.get().offset.x, stepX);
      width = snappedX - x;
    }

    if (direction.includes("l")) {
      const snappedX = snapToStep(x, grid.get().offset.x, stepX);
      const newX = snappedX;
      width = width + (x - newX);
      x = newX;
    }

    if (direction.includes("b")) {
      const snappedY = snapToStep(y + height, grid.get().offset.y, stepY);
      height = snappedY - y;
    }

    if (direction.includes("t")) {
      const snappedY = snapToStep(y, grid.get().offset.y, stepY);
      const newY = snappedY;
      height = height + (y - newY);
      y = newY;
    }
  }

  // Limit minimum width & height
  if (width <= minSize) {
    x = box.x; // Prevent accidental shifting
    width = minSize;
  }
  if (height <= minSize) {
    y = box.y; // Prevent accidental shifting
    height = minSize;
  }

  server.send({
    type: "request_transform",
    transform: {
      id: elements[0].getAttribute("id")!,
      x,
      y,
      w: width,
      h: height,
    },
  });
}

export const resize = { start, stop, send };
