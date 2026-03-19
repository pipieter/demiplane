import { grid } from "../../grid";
import { viewport } from "../../viewport";

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

const drawUtil = { getEventCoordinates };
export default drawUtil;
