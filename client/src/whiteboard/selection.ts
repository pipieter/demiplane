const backgroundLayer = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
const transformLayer = document.getElementById("whiteboard-resize") as unknown as SVGSVGElement;
const selected: Set<string> = new Set();

function initialize() {
  backgroundLayer.onclick = clear;
}

function clear() {
  for (const id of selected) {
    remove(id);
  }
  transformLayer.style.display = "none"; // hide the transform layer
}

function remove(id: string) {
  selected.delete(id);
  document.getElementById(id)?.classList.remove("selected");
}

function get() {
  return [...selected];
}

function elements() {
  return [...selected].map((selected) => document.getElementById(selected) as unknown as SVGGraphicsElement);
}

function add(id: string) {
  selected.add(id);
  document.getElementById(id)?.classList.add("selected");
}

function select(ids: string[]) {
  clear();
  for (const id of ids) {
    add(id);
  }
}

const selection = { initialize, clear, get, add, select, elements };
export default selection;
