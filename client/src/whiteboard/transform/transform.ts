import { grid } from "../../grid";
import { server } from "../../server";
import { viewport } from "../viewport";
import { resizebox } from "./resizebox";
import { util } from "../../util";
import selection from "../selection";

const container = document.getElementById("whiteboard-container") as HTMLDivElement;

/**
 *  Mutates an SVGElement to get drag-behavior.
 */
function makeDraggable(element: SVGElement) {
  element.onmousedown = select;

  function select(e: MouseEvent) {
    e.preventDefault();

    document.onmouseup = deselect;
    document.onmousemove = drag;

    selection.clear();
    element.classList.add("selected");
    selection.add(element.getAttribute("id")!);
    resizebox.show(element as SVGGraphicsElement);
  }

  function drag(e: MouseEvent) {
    resizebox.hide();
    const cursor = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
    const bbox = (element as SVGGraphicsElement).getBBox();
    let { x, y } = e.shiftKey
      ? grid.getGridlockedCoords(cursor.x, cursor.y)
      : {
          x: cursor.x,
          y: cursor.y,
        };

    x -= bbox.width / 2;
    y -= bbox.height / 2;
    if (!util.mouseOnElement(e, container)) return;

    server.send({
      type: "request_transform",
      transform: {
        id: element.id,
        x,
        y,
        w: bbox.width,
        h: bbox.height,
      },
    });
  }

  function deselect() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (selection.get().length <= 0) {
      resizebox.hide();
    }
  }
}

function set(id: string, x: number, y: number, w: number, h: number) {
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

export const transform = { set, makeDraggable };
