import { whiteboard } from "./whiteboard";
import { server } from "./server";
import { viewport } from "./viewport";
import { grid } from "./grid";

const resizeLayer = document.getElementById("whiteboard-resize");
const resizeBox = document.getElementById("resize-box");

let cursorStartPosition = { x: 0, y: 0 };
let elementStartSize: DOMRect = new DOMRect(0, 0, 0, 0);

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
}

function setHandle(id: string, x: number, y: number, size: number) {
  const h = document.getElementById(id);
  if (!h) return;
  h.setAttribute("x", x.toString());
  h.setAttribute("y", y.toString());
  h.setAttribute("width", size.toString());
  h.setAttribute("height", size.toString());
}

let resizeDir: string | null = null;
document.querySelectorAll<SVGRectElement>(".resize-handle").forEach((h) => {
  h.addEventListener("mousedown", startResize);
});

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
      width = (elementStartSize.width + dx);
      height = (elementStartSize.height - dy);
      y = elementStartSize.y + (elementStartSize.height - height);
      break;

    case "bl":
      width = (elementStartSize.width - dx);
      height = (elementStartSize.height + dy);
      x = elementStartSize.x + (elementStartSize.width - width);
      break;

    case "tl":
      width = (elementStartSize.width - dx);
      height = (elementStartSize.height - dy);
      x = elementStartSize.x + (elementStartSize.width - width);
      y = elementStartSize.y + (elementStartSize.height - height);
      break;
  }

  if (e.shiftKey) {
    if (resizeDir.includes("r")) {
      const snapped = grid.getGridlockedCoords(x + width, y);
      width = snapped.x - x;
    }

    if (resizeDir.includes("l")) {
      const snapped = grid.getGridlockedCoords(x, y);
      const newX = snapped.x;
      width = width + (x - newX);
      x = newX;
    }

    if (resizeDir.includes("b")) {
      const snapped = grid.getGridlockedCoords(x, y + height);
      height = snapped.y - y;
    }

    if (resizeDir.includes("t")) {
      const snapped = grid.getGridlockedCoords(x, y);
      const newY = snapped.y;
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

  console.log(width, height);


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
