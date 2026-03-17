import { whiteboard } from "./whiteboard";
import socket from "./socket";
import { viewport } from "./viewport";

const resizeLayer = document.getElementById("whiteboard-resize");
const resizeBox = document.getElementById("resize-box");

let prevPosition = { x: 0, y: 0 };

function showBox(element: SVGGraphicsElement) {
  if (!resizeBox) return;
  const box = element.getBBox();

  if (resizeLayer) resizeLayer.style.display = "block";
  const offset = 3;
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
  const target = e.target as HTMLElement;
  resizeDir = target.dataset.dir ?? null;

  prevPosition = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  document.addEventListener("mousemove", sendSizeRequest);
  document.addEventListener("mouseup", stopResize);
}

function stopResize() {
  document.removeEventListener("mousemove", sendSizeRequest);
  document.removeEventListener("mouseup", stopResize);
  resizeDir = null;
}

function sendSizeRequest(e: MouseEvent) {
  if (whiteboard.selected.length <= 0 || !resizeDir) return;
  const box = (whiteboard.selected[0] as SVGGraphicsElement).getBBox();
  showBox(whiteboard.selected[0] as SVGGraphicsElement);

  let x = box.x;
  let y = box.y;
  let width = box.width;
  let height = box.height;

  const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
  const dx = current.x - prevPosition.x;
  const dy = current.y - prevPosition.y;
  prevPosition = current;

  switch (resizeDir) {
    case "br":
      width += dx;
      height += dy;
      break;

    case "tr":
      width += dx;
      height -= dy;
      y += dy;
      break;

    case "bl":
      width -= dx;
      x += dx;
      height += dy;
      break;

    case "tl":
      width -= dx;
      x += dx;
      height -= dy;
      y += dy;
      break;
  }

  // Limit minimum width & height
  if (width <= 8) {
    x = box.x; // Prevent accidental shifting
    width = 8;
  }
  if (height <= 8) {
    y = box.y; // Prevent accidental shifting
    height = 8;
  }

  socket.send(
    JSON.stringify({
      type: "request_transform",
      transform: {
        id: whiteboard.selected[0].id,
        x,
        y,
        w: width,
        h: height,
      },
    }),
  );
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
