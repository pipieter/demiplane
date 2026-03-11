let gridSize = 64;

export function setGridSize(newSize: number) {
  gridSize = newSize;
  const gridPatternElement = document.getElementById("grid-pattern");
  if (!gridPatternElement) return;
  const path = gridPatternElement.querySelector("path");
  if (!path) return;

  gridPatternElement.setAttribute("width", `${gridSize}px`);
  gridPatternElement.setAttribute("height", `${gridSize}px`);
  path.setAttribute("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`);
}

export function getGridLockedCoordinate(x: number): number {
  return (Math.floor(x / gridSize) * gridSize) + gridSize / 2;
}