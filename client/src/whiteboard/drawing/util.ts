import { grid } from "../grid";
import { viewport } from "../viewport";

const cursor = document.getElementById("whiteboard-drawing-cursor") as unknown as SVGCircleElement;

// TODO there is some code duplication with transform:getSnapStep and movement:snapElement that can be removed
function getEventCoordinates(evt: MouseEvent) {
  let { x, y } = viewport.getZoomTranslatedCoords(evt.offsetX, evt.offsetY);
  if (evt.shiftKey) {
    const gridLocked = grid.getGridlockedCoords(x, y);
    x = gridLocked.x;
    y = gridLocked.y;
  }
  return { x, y };
}

function updateCursor(evt: MouseEvent) {
  const { x, y } = getEventCoordinates(evt);
  cursor.setAttribute("cx", x.toString());
  cursor.setAttribute("cy", y.toString());
}

const drawUtil = { getEventCoordinates, updateCursor };
export default drawUtil;
