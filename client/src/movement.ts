import { clearSelection, container, selected } from "./drawing";
import { getGridLockedCoordinates } from "./grid";
import socket from "./socket";

export function cursorWithinElement(e: MouseEvent, element: Element): boolean {
    const { left, right, top, bottom } = element.getBoundingClientRect();

    return (
        e.clientX >= left &&
        e.clientX <= right &&
        e.clientY >= top &&
        e.clientY <= bottom
    );
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
    }

    function dragElement(e: MouseEvent) {
        let { x, y } = e.shiftKey 
            ? getGridLockedCoordinates(e.offsetX, e.offsetY)
            : { x: e.offsetX - element.getBoundingClientRect().width / 2, y: e.offsetY - element.getBoundingClientRect().height / 2 };

        if (!cursorWithinElement(e, container)) return;

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

    function deselectElement(_e: MouseEvent){
        document.onmouseup = null;
        document.onmousemove = null;
    }
}