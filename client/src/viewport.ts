import * as d3 from "d3-selection";
import * as d3Zoom from "d3-zoom";

const drawingElement = d3.select("#drawing");
const viewportElement = d3.select("#viewport");

export const zoom = d3Zoom
  .zoom()
  .scaleExtent([0.1, 10])
  .filter((event) => {
    if (event.type === "wheel") return true;

    const target = event.target as HTMLElement | SVGElement;
    if (!target) return true;
    return (
      target.id === "drawing-background" || target.id === "drawing" || target.closest("#drawing-background") !== null
    );
  })
  .on("zoom", (event) => {
    viewportElement.attr("transform", event.transform);
  });

function initialize() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  drawingElement.call(zoom as any);
}

export function getZoomTranslatedCoords(x: number, y: number): { x: number; y: number } {
  const node = drawingElement.node() as SVGSVGElement;
  if (!node) return { x, y };

  const transform = d3Zoom.zoomTransform(node);
  return {
    x: (x - transform.x) / transform.k,
    y: (y - transform.y) / transform.k,
  };
}

export const viewport = { initialize };
