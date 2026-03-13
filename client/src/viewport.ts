import * as d3 from "d3-selection";
import * as d3Zoom from "d3-zoom";

const whiteboardElement = d3.select("#whiteboard");
const viewportElement = d3.select("#viewport");

export const zoom = d3Zoom
  .zoom()
  .scaleExtent([0.1, 10])
  .filter((event) => {
    if (event.type === "wheel") return true;

    const target = event.target as HTMLElement | SVGElement;
    if (!target) return true;
    return (
      target.id === "whiteboard-background-layer" ||
      target.id === "whiteboard" ||
      target.closest("#whiteboard-background-layer") !== null
    );
  })
  .on("zoom", (event) => {
    viewportElement.attr("transform", event.transform);
  });

function initialize() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whiteboardElement.call(zoom as any);
}

export function getZoomTranslatedCoords(x: number, y: number): { x: number; y: number } {
  const node = whiteboardElement.node() as SVGSVGElement;
  if (!node) return { x, y };

  const transform = d3Zoom.zoomTransform(node);
  return {
    x: (x - transform.x) / transform.k,
    y: (y - transform.y) / transform.k,
  };
}

export const viewport = { initialize };
