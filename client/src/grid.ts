import { server } from "./server";

export interface GridData {
  size: number;
  offset: {
    x: number;
    y: number;
  };
}

let size = 64;
let offset = { x: 0, y: 0 };
const gridSizeInput = document.getElementById("grid-size") as HTMLInputElement | null;
const gridOffsetXInput = document.getElementById("grid-offset-X") as HTMLInputElement | null;
const gridOffsetYInput = document.getElementById("grid-offset-Y") as HTMLInputElement | null;

function get(): GridData {
  return { size, offset };
}

function set(newSize: number, offsetX: number, offsetY: number) {
  size = newSize;
  offset = { x: offsetX, y: offsetY };

  if (gridSizeInput) gridSizeInput.value = size.toString();
  if (gridOffsetXInput) {
    gridOffsetXInput.value = offset.x.toString();
    gridOffsetXInput.min = (-size / 2).toString();
    gridOffsetXInput.max = (size / 2).toString();
  }
  if (gridOffsetYInput) {
    gridOffsetYInput.value = offset.y.toString();
    gridOffsetYInput.min = (-size / 2).toString();
    gridOffsetYInput.max = (size / 2).toString();
  }

  const gridPatternElement = document.getElementById("grid-pattern");
  if (!gridPatternElement) return;
  const path = gridPatternElement.querySelector("path");
  if (!path) return;

  gridPatternElement.setAttribute("width", `${size}px`);
  gridPatternElement.setAttribute("height", `${size}px`);
  path.setAttribute("d", `M ${size} 0 L 0 0 0 ${size}`);

  gridPatternElement.setAttribute("patternTransform", `translate(${offset.x}, ${offset.y})`);
}

function getGridLockedCoordinates(x: number, y: number): { x: number; y: number } {
  const localX = x - offset.x;
  const localY = y - offset.y;

  return {
    x: Math.floor(localX / size) * size + offset.x,
    y: Math.floor(localY / size) * size + offset.y,
  };
}

function sendGridRequest() {
  server.send({
    type: "request_grid",
    grid: get(),
  });
}

function initialize() {
  gridSizeInput?.addEventListener("input", () => {
    size = Number(gridSizeInput.value);
    sendGridRequest();
  });

  gridOffsetXInput?.addEventListener("input", () => {
    offset.x = Number(gridOffsetXInput.value);
    sendGridRequest();
  });

  gridOffsetYInput?.addEventListener("input", () => {
    offset.y = Number(gridOffsetYInput.value);
    sendGridRequest();
  });
}

export const grid = { get, set, initialize, getGridLockedCoordinates };
