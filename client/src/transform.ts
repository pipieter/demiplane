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
      y: box.y + box.height / 2,
    };

    isRotating = true;
    document.addEventListener("mousemove", rotateMove);
    document.addEventListener("mouseup", stopRotate);
  });
}

function rotateMove(e: MouseEvent) {
  if (!isRotating) return;

  const el = whiteboard.getSelected()[0] as SVGGraphicsElement;
  const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  const dx = current.x - rotationCenter.x;
  const dy = current.y - rotationCenter.y;
  const angleDeg = Math.floor(Math.atan2(dy, dx) * (180 / Math.PI) + 90);

  const transform = `rotate(${angleDeg} 0 0)`;
  el.setAttribute("transform", transform);
  showBox(el);
}

function stopRotate() {
  isRotating = false;
  document.removeEventListener("mousemove", rotateMove);
  document.removeEventListener("mouseup", stopRotate);
}

function getElementRotationDegree(element: SVGGraphicsElement): number {
  const transform = element.getAttribute("transform");
  if (!transform) return 0;
  const match = transform.match(/rotate\(([-\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
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
  const angle = getElementRotationDegree(element);

  resizeBox.setAttribute("x", box.x.toString());
  resizeBox.setAttribute("y", box.y.toString());
  resizeBox.setAttribute("width", box.width.toString());
  resizeBox.setAttribute("height", box.height.toString());
  resizeBox.setAttribute("transform", `rotate(${angle} 0 0)`);

  positionHandles(box, angle);
}

function hideBox() {
  if (resizeLayer) resizeLayer.style.display = "none";
}

function rotatePoint(px: number, py: number, cx: number, cy: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const dx = px - cx;
  const dy = py - cy;

  const x = cx + dx * cos - dy * sin;
  const y = cy + dx * sin + dy * cos;

  return { x, y };
}

function positionHandles(box: DOMRect, angle: number = 0) {
  const size = 8;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  const points: Record<string, { x: number; y: number }> = {
    "handle-tr": { x: box.x + box.width, y: box.y },
    "handle-tl": { x: box.x, y: box.y },
    "handle-bl": { x: box.x, y: box.y + box.height },
    "handle-br": { x: box.x + box.width, y: box.y + box.height },
  };

  for (const id in points) {
    const rotated = rotatePoint(points[id].x, points[id].y, centerX, centerY, angle);
    setHandle(id, rotated.x - size / 2, rotated.y - size / 2, size);
  }

  setHandle("handle-tr", box.x - size / 2, box.y - size / 2, size, angle, centerX, centerY);
  setHandle("handle-tl", box.x + box.width - size / 2, box.y - size / 2, size, angle, centerX, centerY);
  setHandle("handle-bl", box.x - size / 2, box.y + box.height - size / 2, size, angle, centerX, centerY);
  setHandle("handle-br", box.x + box.width - size / 2, box.y + box.height - size / 2, size, angle, centerX, centerY);
  setRotateHandle(box, centerX, centerY, angle);
}

function setHandle(
  id: string,
  x: number,
  y: number,
  size: number,
  angle: number = 0,
  centerX?: number,
  centerY?: number,
) {
  const h = document.getElementById(id);
  if (!h) return;
  h.setAttribute("x", x.toString());
  h.setAttribute("y", y.toString());
  h.setAttribute("width", size.toString());
  h.setAttribute("height", size.toString());

  if (centerX !== undefined && centerY !== undefined) {
    h.setAttribute("transform", `rotate(${angle} ${centerX - x - size / 2} ${centerY - y - size / 2})`);
  } else {
    h.removeAttribute("transform");
  }
}

function setRotateHandle(box: DOMRect, centerX: number, centerY: number, angle: number) {
  const handle = document.getElementById("rotate-handle");
  const line = document.getElementById("rotate-line");

  if (!handle) return;

  const topCenterX = box.x + box.width / 2;
  const topCenterY = box.y - 20; // offset

  const rotated = rotatePoint(topCenterX, topCenterY, centerX, centerY, angle);
  handle.setAttribute("cx", rotated.x.toString());
  handle.setAttribute("cy", rotated.y.toString());

  if (line) {
    line.setAttribute("x1", centerX.toString());
    line.setAttribute("y1", centerY.toString());
    line.setAttribute("x2", rotated.x.toString());
    line.setAttribute("y2", rotated.y.toString());
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
