import socket from "./socket";

export interface GridData {
  size: number;
  offset: {
    x: number;
    y: number;
  };
}

export let grid: GridData = { size: 64, offset: { x: 0, y: 0 } };

const gridSizeInput = document.getElementById("grid-size") as HTMLInputElement | null;
const gridOffsetXInput = document.getElementById("grid-offset-X") as HTMLInputElement | null;
const gridOffsetYInput = document.getElementById("grid-offset-Y") as HTMLInputElement | null;

export function setGrid(gridData: GridData) {
  grid = gridData;

  if (gridSizeInput) gridSizeInput.value = grid.size.toString();
  if (gridOffsetXInput) {
    gridOffsetXInput.value = grid.offset.x.toString();
    gridOffsetXInput.min = (-grid.size / 2).toString();
    gridOffsetXInput.max = (grid.size / 2).toString();
  }
  if (gridOffsetYInput) {
    gridOffsetYInput.value = grid.offset.y.toString();
    gridOffsetYInput.min = (-grid.size / 2).toString();
    gridOffsetYInput.max = (grid.size / 2).toString();
  }

  const gridPatternElement = document.getElementById("grid-pattern");
  if (!gridPatternElement) return;
  const path = gridPatternElement.querySelector("path");
  if (!path) return;

  gridPatternElement.setAttribute("width", `${grid.size}px`);
  gridPatternElement.setAttribute("height", `${grid.size}px`);
  path.setAttribute("d", `M ${grid.size} 0 L 0 0 0 ${grid.size}`);

  gridPatternElement.setAttribute("patternTransform", `translate(${grid.offset.x}, ${grid.offset.y})`);
}

export function getGridLockedCoordinates(x: number, y: number): { x: number; y: number } {
  const localX = x - grid.offset.x;
  const localY = y - grid.offset.y;

  return {
    x: Math.floor(localX / grid.size) * grid.size + grid.size / 2 + grid.offset.x,
    y: Math.floor(localY / grid.size) * grid.size + grid.size / 2 + grid.offset.y,
  };
}

function sendGridRequest() {
  socket.send(
    JSON.stringify({
      type: "request_grid",
      grid: grid,
    }),
  );
}

gridSizeInput?.addEventListener("input", () => {
  grid.size = Number(gridSizeInput.value);
  sendGridRequest();
});

gridOffsetXInput?.addEventListener("input", () => {
  grid.offset.x = Number(gridOffsetXInput.value);
  sendGridRequest();
});

gridOffsetYInput?.addEventListener("input", () => {
  grid.offset.y = Number(gridOffsetYInput.value);
  sendGridRequest();
});
