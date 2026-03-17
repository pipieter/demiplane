import { viewport } from "./viewport";
import { server } from "./server";

const layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
const line = document.getElementById("whiteboard-drawing-line") as unknown as SVGPathElement;
const points: [number, number][] = [];
let mouseDown = false;

function updateLine() {
  if (!points || points.length === 0) {
    line.removeAttribute("d");
    return;
  }

  const combined = "M " + points.map(([x, y]) => `${x} ${y}`).join(" L ");
  line.setAttribute("d", combined);
}

function begin() {
  mouseDown = false;
  layer.style.display = "";
  layer.style.pointerEvents = "";
  points.splice(0);
  updateLine();

  layer.onmousedown = () => (mouseDown = true);
  layer.onmouseup = end;
  layer.onmousemove = addPoint;
  viewport.disable();
}

function addPoint(evt: MouseEvent) {
  if (!mouseDown) return;

  const { x, y } = viewport.getZoomTranslatedCoords(evt.offsetX, evt.offsetY);
  points.push([x, y]);
  updateLine();
}

async function end() {
  await create();
  viewport.enable();
  layer.onmousedown = null;
  layer.onmouseup = null;
  layer.onmousemove = null;
  layer.style.display = "none";

  return;
}

async function create() {
  const bbox = line.getBBox();
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

const drawing = { begin };
export default drawing;
