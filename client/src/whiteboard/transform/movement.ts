import { whiteboard } from "../../whiteboard";
import { grid } from "../../grid";
import { server } from "../../server";
import { viewport } from "../../viewport";
import { resizebox } from "./resizebox";

function cursorWithinElement(e: MouseEvent, element: Element): boolean {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom;
}

/**
 *  Mutates an SVGElement to get drag-behavior.
 */
function makeDraggable(element: SVGElement) {
  element.onmousedown = mouseDown;

  function mouseDown(e: MouseEvent) {
    e.preventDefault();

    document.onmouseup = deselectElement;
    document.onmousemove = dragElement;

    whiteboard.clearSelection();
    element.classList.add("selected");
    whiteboard.addSelected(element);
    resizebox.show(element as SVGGraphicsElement);
  }

  function dragElement(e: MouseEvent) {
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
    if (!cursorWithinElement(e, whiteboard.container)) return;

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

  function deselectElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (whiteboard.getSelected().length <= 0) {
      resizebox.hide();
    }
  }
}

export const movement = { makeDraggable };
