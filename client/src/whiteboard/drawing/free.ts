import { viewport } from "../../viewport";
import { server } from "../../server";
import drawUtil from "./util";

const layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
const element = document.getElementById("whiteboard-drawing-free") as unknown as SVGPathElement;

let mouseDown = false;
const points: [number, number][] = [];

function begin() {
  viewport.disable();
  mouseDown = false;
  layer.style.display = "";
  layer.style.pointerEvents = "";
  element.style.display = "none";

  points.splice(0);
  updateLine();

  layer.onmousedown = onmousedown;
  layer.onmouseup = end;
  layer.onmousemove = update;
  document.onkeydown = onkeydown;
}

function update(evt: MouseEvent) {
  drawUtil.updateCursor(evt);

  if (!mouseDown) return;

  const { x, y } = viewport.getZoomTranslatedCoords(evt.offsetX, evt.offsetY);
  points.push([x, y]);
  updateLine();
}

function updateLine() {
  if (!points || points.length === 0) {
    element.removeAttribute("d");
    return;
  }

  const combined = "M " + points.map(([x, y]) => `${x} ${y}`).join(" L ");
  element.setAttribute("d", combined);
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
    element.style.display = "";
    points.push([x, y]);
    updateLine();
  }
}

function onkeydown(evt: KeyboardEvent) {
  if (evt.key === "Escape") cancel();
}

function cancel() {
  layer.onmousedown = null;
  layer.onmouseup = null;
  layer.onmousemove = null;
  document.onkeydown = null;
  layer.style.display = "none";
  element.style.display = "none";
  viewport.enable();
}

async function end() {
  await upload();
  cancel();
}

async function upload() {
  const bbox = element.getBBox();
  const x = bbox.x;
  const y = bbox.y;
  const width = bbox.width;
  const height = bbox.height;
  const lineWidth = 10;

  const canvas = document.createElement("canvas");

  // A small addition is required to ensure that the line doesn't get cut off at the borders
  canvas.width = width + 2 * lineWidth;
  canvas.height = height + 2 * lineWidth;

  const ctx = canvas.getContext("2d")!;
  ctx.translate(-x + lineWidth, -y + lineWidth);
  ctx.lineWidth = lineWidth;

  if (points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
  }

  const base64 = canvas.toDataURL();
  const href = await server.uploadImageToBackend(base64);
  if (!href) return;

  // Because the image is slightly larger due to the line padding, a small shift is required
  const targetX = x - lineWidth;
  const targetY = y - lineWidth;
  server.send({
    type: "request_create",
    create: {
      type: "image",
      href,
      x: targetX,
      y: targetY,
      w: width + 2 * lineWidth,
      h: height + 2 * lineWidth,
    },
  });
}

const drawFree = { begin };
export default drawFree;
