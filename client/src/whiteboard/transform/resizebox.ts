import { resize } from "./resize";

const layer = document.getElementById("whiteboard-resize");
const resizeBox = document.getElementById("resize-box");

function show(element: SVGGraphicsElement) {
  if (!resizeBox) return;
  const box = element.getBBox();

  if (layer) layer.style.display = "block";
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

function hide() {
  if (layer) layer.style.display = "none";
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

document.querySelectorAll<SVGRectElement>(".resize-handle").forEach((h) => {
  h.addEventListener("mousedown", resize.start);
});

export const resizebox = { show, hide, layer };
