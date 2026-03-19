import { server } from "../../server";
import { viewport } from "../../viewport";
import drawUtil from "./util";

const layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
const element = document.getElementById("whiteboard-drawing-rectangle") as unknown as SVGRectElement;

let mouseDown = false;
const start = { x: 0, y: 0 };
const current = { x: 0, y: 0 };

function begin() {
  viewport.disable();
  mouseDown = false;
  layer.style.display = "";
  layer.style.pointerEvents = "";
  element.style.display = "none";
  element.setAttribute("x", "0");
  element.setAttribute("y", "0");
  element.setAttribute("width", "0");
  element.setAttribute("height", "0");

  layer.onmousedown = (evt) => {
    const { x, y } = drawUtil.getEventCoordinates(evt);

    mouseDown = true;
    start.x = x;
    start.y = y;
    current.x = x;
    current.y = y;
    element.style.display = "";
  };
  layer.onmouseup = end;
  layer.onmousemove = update;
}

function getCurrentDimensions() {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const w = Math.abs(start.x - current.x);
  const h = Math.abs(start.y - current.y);
  return { x, y, w, h };
}

function update(evt: MouseEvent) {
  if (!mouseDown) return;

  {
    const { x, y } = drawUtil.getEventCoordinates(evt);
    current.x = x;
    current.y = y;
  }

  {
    const { x, y, w, h } = getCurrentDimensions();
    element.setAttribute("x", x.toString());
    element.setAttribute("y", y.toString());
    element.setAttribute("width", w.toString());
    element.setAttribute("height", h.toString());
  }
}

function end() {
  mouseDown = false;
  element.style.display = "none";
  layer.style.display = "none";
  layer.onmousedown = null;
  layer.onmouseup = null;
  layer.onmousemove = null;
  viewport.enable();

  const { x, y, w, h } = getCurrentDimensions();
  const color = "#00FF00"; // TODO

  server.send({
    type: "request_create",
    create: {
      type: "rectangle",
      color,
      x,
      y,
      w,
      h,
    },
  });
}

const drawRectangle = { begin };
export default drawRectangle;
