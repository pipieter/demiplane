export let gridSize = 64;
export let gridOffset = { x: 0, y: 0 };

const gridSizeInput = document.getElementById('grid-size') as HTMLInputElement | null;
const gridOffsetXInput = document.getElementById('grid-offset-X') as HTMLInputElement | null;
const gridOffsetYInput = document.getElementById('grid-offset-Y') as HTMLInputElement | null;

export function setGrid(newSize: number, offsetX: number = 0, offsetY: number = 0) {
  gridSize = newSize;
  gridOffset.x = offsetX;
  gridOffset.y = offsetY;

  if (gridSizeInput) gridSizeInput.value = gridSize.toString();
  if (gridOffsetXInput) {
    gridOffsetXInput.value = gridOffset.x.toString();
    gridOffsetXInput.max = gridSize.toString();
  }
  if (gridOffsetYInput) {
    gridOffsetYInput.value = gridOffset.y.toString();
    gridOffsetYInput.max = gridSize.toString();
  }

  const gridPatternElement = document.getElementById("grid-pattern");
  if (!gridPatternElement) return;
  const path = gridPatternElement.querySelector("path");
  if (!path) return;

  gridPatternElement.setAttribute("width", `${gridSize}px`);
  gridPatternElement.setAttribute("height", `${gridSize}px`);
  path.setAttribute("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`);

  gridPatternElement.setAttribute(
    "patternTransform",
    `translate(${gridOffset.x}, ${gridOffset.y})`
  );
}

export function getGridLockedCoordinates(x: number, y: number): { x: number, y: number } {
  return {
    x: Math.floor(x / gridSize) * gridSize + gridSize / 2 + gridOffset.x,
    y: Math.floor(y / gridSize) * gridSize + gridSize / 2 + gridOffset.y
  }
}

gridSizeInput?.addEventListener('input', () => {
  const size = Number(gridSizeInput.value);
  setGrid(size, gridOffset.x, gridOffset.y)
})

gridOffsetXInput?.addEventListener('input', () => {
  const offset = Number(gridOffsetXInput.value);
  setGrid(gridSize, offset, gridOffset.y)
})

gridOffsetYInput?.addEventListener('input', () => {
  const offset = Number(gridOffsetYInput.value);
  setGrid(gridSize, gridOffset.x, offset)
})