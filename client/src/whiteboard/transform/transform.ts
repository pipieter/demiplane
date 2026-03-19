import { grid } from "../grid";
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

export const transform = { makeDraggable };
