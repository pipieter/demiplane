import socket from "./socket";

let selected: SVGSVGElement | undefined;

// @ts-ignore
let selectionBox: SVGSVGElement = document.getElementById("drawing-selection-box");

function unselect() {
  selected = undefined;
  updateSelectionBox();
}

function select(id: string) {
  // If selecting the same object again, toggle its selection instead
  // and de-select it
  if (selected && selected.id === id) {
    unselect();
    return;
  }

  // @ts-ignore
  selected = document.getElementById(id);
  updateSelectionBox();
}

function updateSelectionBox() {
  if (!selected) {
    selectionBox.setAttribute("stroke-width", "0");
    return;
  }

  const box = selected.getBBox();
  selectionBox.setAttribute("x", box.x.toString());
  selectionBox.setAttribute("y", box.y.toString());
  selectionBox.setAttribute("width", box.width.toString());
  selectionBox.setAttribute("height", box.height.toString());
  selectionBox.setAttribute("stroke-width", "5");
}

function move(id: string, x: number, y: number) {
  const element = document.getElementById(id) as unknown as SVGSVGElement;
  element.setAttribute("cx", x.toString());
  element.setAttribute("cy", y.toString());
  updateSelectionBox();
}

function getObjectsCollection(): SVGSVGElement {
  // @ts-ignore
  return document.getElementById("drawing-objects");
}

function initialize() {
  // @ts-ignore
  const background = document.getElementById("drawing-background") as SVGSVGElement;
  background.onclick = unselect;
}

function createCircle(id: string, color: string, x: number, y: number, radius: number) {
  const collection = getObjectsCollection();
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

  circle.setAttribute("id", id);
  circle.setAttribute("fill", color);
  circle.setAttribute("cx", x.toString());
  circle.setAttribute("cy", y.toString());
  circle.setAttribute("r", radius.toString());
  circle.style.cursor = "pointer";
  circle.onclick = () => select(id);
  circle.onmousemove = (evt) => {
    // Only allow move if the item is selected
    if (selected?.getAttribute("id") !== id) return;

    // Only allow move if the left mouse button was pressed
    if ((evt.buttons & 1) !== 1) return;

    // TODO find a cleaner way of doing this
    const x = evt.clientX;
    const y = evt.clientY;

    socket.send(
      JSON.stringify({
        type: "request_move",
        move: {
          id,
          x,
          y,
        },
      }),
    );
  };

  collection.appendChild(circle);
}

const drawing = { initialize, createCircle, move };

export default drawing;
