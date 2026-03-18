import { whiteboard } from "./whiteboard";
import { server } from "./server";
import { viewport } from "./viewport";
import { grid } from "./grid";

const resizeLayer = document.getElementById("whiteboard-resize");
const resizeBox = document.getElementById("resize-box");
const rotateHandle = document.getElementById("rotate-handle");

let resizeDir: string | null = null;
let cursorStartPosition = { x: 0, y: 0 };
let elementStartSize: DOMRect = new DOMRect(0, 0, 0, 0);
let isRotating = false;
let rotationCenter = { x: 0, y: 0 };

document.querySelectorAll<SVGRectElement>(".resize-handle").forEach((h) => {
  h.addEventListener("mousedown", startResize);
});

if (rotateHandle) {
  rotateHandle.addEventListener("mousedown", (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const box = (whiteboard.getSelected()[0] as SVGGraphicsElement).getBBox();
    rotationCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    }

    isRotating = true;
    document.addEventListener("mousemove", rotateMove);
    document.addEventListener("mouseup", stopRotate);
  })
}

function rotateMove(e: MouseEvent) {
  if (!isRotating) return;

  const el = whiteboard.getSelected()[0] as SVGGraphicsElement;
  const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  const dx = current.x - rotationCenter.x;
  const dy = current.y - rotationCenter.y;
  const angleDeg = Math.floor((Math.atan2(dy, dx) * (180 / Math.PI)) + 90);

  const transform = `rotate(${angleDeg} ${rotationCenter.x} ${rotationCenter.y})`;
  el.setAttribute("transform", transform);
  rotateBox(transform);
}

function stopRotate() {
  isRotating = false;
  document.removeEventListener("mousemove", rotateMove);
  document.removeEventListener("mouseup", stopRotate);
}

function rotateBox(rotateTransform: string) {
  if (resizeBox) resizeBox.setAttribute("transform", rotateTransform);
  document.querySelectorAll<SVGRectElement>(".resize-handle").forEach((h) => {
    h.setAttribute("transform", rotateTransform);
  });
  if (rotateHandle) rotateHandle.setAttribute("transform", rotateTransform);
  document.getElementById("rotate-line")?.setAttribute("transform", rotateTransform);
}

function showBox(element: SVGGraphicsElement) {
  if (!resizeBox) return;
  const box = element.getBBox();

  if (resizeLayer) resizeLayer.style.display = "block";
  const offset = 0;
  box.x -= offset;
  box.y -= offset;
  box.width += offset * 2;
  box.height += offset * 2;

  resizeBox.setAttribute("x", box.x.toString());
  resizeBox.setAttribute("y", box.y.toString());
  resizeBox.setAttribute("width", box.width.toString());
  resizeBox.setAttribute("height", box.height.toString());

  positionHandles(box);
  const transform = element.getAttribute("transform") ?? "rotate(0 0 0)";
  rotateBox(transform);
}

function hideBox() {
  if (resizeLayer) resizeLayer.style.display = "none";
}

function positionHandles(box: DOMRect) {
  const size = 8;

  setHandle("handle-tr", box.x - size / 2, box.y - size / 2, size);
  setHandle("handle-tl", box.x + box.width - size / 2, box.y - size / 2, size);
  setHandle("handle-bl", box.x - size / 2, box.y + box.height - size / 2, size);
  setHandle("handle-br", box.x + box.width - size / 2, box.y + box.height - size / 2, size);
  setRotateHandle(box);
}

function setHandle(id: string, x: number, y: number, size: number) {
  const h = document.getElementById(id);
  if (!h) return;
  h.setAttribute("x", x.toString());
  h.setAttribute("y", y.toString());
  h.setAttribute("width", size.toString());
  h.setAttribute("height", size.toString());
}

function setRotateHandle(box: DOMRect) {
  const handle = document.getElementById("rotate-handle");
  const line = document.getElementById("rotate-line");

  if (!handle) return;

  const offset = 20;

  const centerX = box.x + box.width / 2;
  const topY = box.y;

  const x = centerX;
  const y = topY - offset;

  handle.setAttribute("cx", x.toString());
  handle.setAttribute("cy", y.toString());

  if (line) {
    line.setAttribute("x1", centerX.toString());
    line.setAttribute("y1", topY.toString());
    line.setAttribute("x2", x.toString());
    line.setAttribute("y2", y.toString());
  }
}

function startResize(e: MouseEvent) {
  e.stopPropagation();
  const target = e.target as SVGElement;
  resizeDir = target.dataset.dir ?? null;

  cursorStartPosition = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  elementStartSize = (whiteboard.getSelected()[0] as SVGGraphicsElement).getBBox();
  document.addEventListener("mousemove", sendSizeRequest);
  document.addEventListener("mouseup", stopResize);
}

function stopResize() {
  document.removeEventListener("mousemove", sendSizeRequest);
  document.removeEventListener("mouseup", stopResize);
  resizeDir = null;
}

function sendSizeRequest(e: MouseEvent, minSize: number = 8) {
  if (whiteboard.getSelected().length <= 0 || !resizeDir) return;
  const box = (whiteboard.getSelected()[0] as SVGGraphicsElement).getBBox();
  showBox(whiteboard.getSelected()[0] as SVGGraphicsElement);

  let x = box.x;
  let y = box.y;
  let width = box.width;
  let height = box.height;

  const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);

  const dx = current.x - cursorStartPosition.x;
  const dy = current.y - cursorStartPosition.y;

  switch (resizeDir) {
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

    if (resizeDir.includes("r")) {
      const snappedX = snapToStep(x + width, grid.get().offset.x, stepX);
      width = snappedX - x;
    }

    if (resizeDir.includes("l")) {
      const snappedX = snapToStep(x, grid.get().offset.x, stepX);
      const newX = snappedX;
      width = width + (x - newX);
      x = newX;
    }

    if (resizeDir.includes("b")) {
      const snappedY = snapToStep(y + height, grid.get().offset.y, stepY);
      height = snappedY - y;
    }

    if (resizeDir.includes("t")) {
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
      id: whiteboard.getSelected()[0].id,
      x,
      y,
      w: width,
      h: height,
    },
  });
}

function setTransform(id: string, x: number, y: number, w: number, h: number) {
  const element = document.getElementById(id) as unknown as SVGGraphicsElement;

  if (element.tagName === "ellipse") {
    element.setAttribute("cx", (x + w / 2).toString());
    element.setAttribute("cy", (y + h / 2).toString());
    element.setAttribute("rx", (w / 2).toString());
    element.setAttribute("ry", (h / 2).toString());
  } else {
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
    element.setAttribute("width", w.toString());
    element.setAttribute("height", h.toString());
  }
}

export const transform = { showBox, hideBox, setTransform, resizeLayer };
