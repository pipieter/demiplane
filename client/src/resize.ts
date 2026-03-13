import { selected } from "./drawing";

const resizeLayer = document.getElementById("drawing-resize");
const resizeBox = document.getElementById("resize-box");

function show(element: SVGGraphicsElement) {
  if (!resizeBox) return;
  const box = element.getBBox();

  if (resizeLayer) resizeLayer.style.display = "block";
  const offset = 5;
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
  console.log("hi");

  e.stopPropagation();
  const target = e.target as HTMLElement;
  resizeDir = target.dataset.dir ?? null;

  document.addEventListener("mousemove", resizeMove);
  document.addEventListener("mouseup", stopResize);
}

function resizeMove(e: MouseEvent) {
  if (selected.length <= 0 || !resizeDir) return;
  const box = (selected[0] as SVGGraphicsElement).getBBox();

  let x = box.x;
  let y = box.y;
  let width = box.width;
  let height = box.height;

  const dx = e.movementX;
  const dy = e.movementY;
  console.log(dx, dy);

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

  if (selected[0].tagName === "ellipse") {
    selected[0].setAttribute("cx", (x + width / 2).toString());
    selected[0].setAttribute("cy", (y + height / 2).toString());
    selected[0].setAttribute("rx", (width / 2).toString());
    selected[0].setAttribute("ry", (height / 2).toString());
  } else {
    selected[0].setAttribute("x", x.toString());
    selected[0].setAttribute("y", y.toString());
    selected[0].setAttribute("width", width.toString());
    selected[0].setAttribute("height", height.toString());
  }

  resize.show(selected[0] as SVGGraphicsElement);
}

function stopResize() {
  console.log("bye");

  document.removeEventListener("mousemove", resizeMove);
  document.removeEventListener("mouseup", stopResize);

  resizeDir = null;
}

export const resize = { show, hide };
