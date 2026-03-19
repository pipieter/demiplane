import { grid } from "../../grid";
import { server } from "../../server";
import { viewport } from "../../viewport";
import drawUtil from "./util";

const layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
const element = document.getElementById("whiteboard-drawing-circle") as unknown as SVGCircleElement;

let mouseDown = false;
const start = { x: 0, y: 0 };
const current = { x: 0, y: 0 };

function begin() {
  viewport.disable();
  mouseDown = false;
  layer.style.display = "";
  layer.style.pointerEvents = "";
  element.style.display = "none";
  element.setAttribute("cx", "0");
  element.setAttribute("cy", "0");
  element.setAttribute("rx", "0");
  element.setAttribute("ry", "0");

  layer.onmousedown = onmousedown;
  layer.onmouseup = end;
  layer.onmousemove = update;
  document.onkeydown = onkeydown;
}

function getCurrentDimensions() {
  const cx = (start.x + current.x) / 2;
  const cy = (start.y + current.y) / 2;
  const rx = Math.abs((start.x - current.x) / 2);
  const ry = Math.abs((start.y - current.y) / 2);
  return { cx, cy, rx, ry };
}

function update(evt: MouseEvent) {
  drawUtil.updateCursor(evt);

  if (!mouseDown) return;

  let { x, y } = viewport.getZoomTranslatedCoords(evt.offsetX, evt.offsetY);
  if (evt.shiftKey) {
    const gridLocked = grid.getGridlockedCoords(x, y);
    x = gridLocked.x;
    y = gridLocked.y;
  }

  current.x = x;
  current.y = y;

  const { cx, cy, rx, ry } = getCurrentDimensions();
  element.setAttribute("cx", cx.toString());
  element.setAttribute("cy", cy.toString());
  element.setAttribute("rx", rx.toString());
  element.setAttribute("ry", ry.toString());
}

function onkeydown(evt: KeyboardEvent) {
  if (evt.key === "Escape") cancel();
}

function onmousedown(evt: MouseEvent) {
  // Cancel on right click
  if (evt.buttons & 2) {
    cancel();
    return;
  }

  // Begin drawing on left click
  if (evt.buttons & 1) {
    const { x, y } = drawUtil.getEventCoordinates(evt);

    mouseDown = true;
    start.x = x;
    start.y = y;
    current.x = x;
    current.y = y;
    element.style.display = "";
    return;
  }
}

function cancel() {
  mouseDown = false;
  element.style.display = "none";
  layer.style.display = "none";
  layer.onmousedown = null;
  layer.onmouseup = null;
  layer.onmousemove = null;
  document.onkeydown = null;
  viewport.enable();
}

function end() {
  cancel();

  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const w = Math.abs(start.x - current.x);
  const h = Math.abs(start.y - current.y);
  const color = "#FF0000"; // TODO

  server.send({
    type: "request_create",
    create: {
      type: "circle",
      color,
      x,
      y,
      w,
      h,
    },
  });
}

const drawCircle = { begin };
export default drawCircle;
