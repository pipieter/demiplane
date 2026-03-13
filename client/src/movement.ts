import { clearSelection, selected, whiteboard } from "./whiteboard";
import { getGridLockedCoordinates } from "./grid";
import { transform } from "./transform";
import socket from "./socket";
import { getZoomTranslatedCoords } from "./viewport";

export function cursorWithinElement(e: MouseEvent, element: Element): boolean {
  const { left, right, top, bottom } = element.getBoundingClientRect();

  return e.clientX >= left && e.clientX <= right && e.clientY >= top && e.clientY <= bottom;
}

/**
 *  Mutates an SVGElement to get drag-behavior.
 */
export function makeElementDraggable(element: SVGElement) {
  element.onmousedown = mouseDown;

  function mouseDown(e: MouseEvent) {
    e.preventDefault();

    document.onmouseup = deselectElement;
    document.onmousemove = dragElement;

    clearSelection();
    element.classList.add("selected");
    selected.push(element);
    transform.showBox(element as SVGGraphicsElement);
  }

  function dragElement(e: MouseEvent) {
    transform.hideBox();
    const cursor = getZoomTranslatedCoords(e.offsetX, e.offsetY);
    const { x, y } = e.shiftKey
      ? getGridLockedCoordinates(cursor.x, cursor.y)
      : {
          x: cursor.x - element.getBoundingClientRect().width / 2,
          y: cursor.y - element.getBoundingClientRect().height / 2,
        };

    if (!cursorWithinElement(e, whiteboard.container)) return;

    socket.send(
      JSON.stringify({
        type: "request_move",
        move: {
          id: element.id,
          x,
          y,
        },
      }),
    );
  }

  function deselectElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (selected.length <= 0) {
      transform.hideBox();
    }
  }
}
