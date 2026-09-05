/// The viewport class is handled through d3 and d3zoom. Because d3 has its own method of working and
/// getting coordinates, only a model is defined without defining a controller or view. The viewport
/// should be client-side only either way, and thus this is not expected to become an issue.

import * as d3 from "d3-selection";
import * as d3Zoom from "d3-zoom";

class Viewport {
  private whiteboard: d3.Selection<SVGSVGElement, unknown, Element, unknown>;
  private viewport: d3.Selection<HTMLDivElement, unknown, Element, unknown>;
  private zoom: d3Zoom.ZoomBehavior<Element, unknown>;

  constructor() {
    this.whiteboard = d3.select("#whiteboard") as unknown as d3.Selection<SVGSVGElement, unknown, Element, unknown>;
    this.viewport = d3.select("#viewport") as d3.Selection<HTMLDivElement, unknown, Element, unknown>;
    this.zoom = d3Zoom
      .zoom()
      .scaleExtent([0.1, 10])
      .translateExtent(this.getTranslateExtent())
      .filter((event) => {
        if (event.type === "wheel") return true;

        const target = event.target as HTMLElement | SVGElement;
        if (!target) return true;
        return (
          target.id === "whiteboard-background-layer" ||
          target.id === "whiteboard" ||
          target.closest("#whiteboard-background-layer") !== null
        );
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.whiteboard.call(this.zoom as any);
    this.enable();

    // Slightly move the default viewport so the edges are easier to follow
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.whiteboard.call(this.zoom.transform as any, d3Zoom.zoomIdentity.translate(100, 50).scale(0.8));

    window.addEventListener("resize", () => {
      this.zoom.translateExtent(this.getTranslateExtent());
    });
  }

  public enable() {
    this.zoom.on("zoom", (event) => {
      this.viewport.attr("transform", event.transform);
      this.zoom.translateExtent(this.getTranslateExtent());
    });
    this.viewport.node()!.style.pointerEvents = "auto";
  }

  public disable() {
    this.zoom.on("zoom", null);
    this.viewport.node()!.style.pointerEvents = "none";
  }

  private getTranslateExtent(): [[number, number], [number, number]] {
    function getAxisExtent(size: number, viewportSize: number, padding: number = 64): [number, number] {
      if (viewportSize > size) return [-viewportSize + size, viewportSize];
      return [-padding, size + padding];
    }

    const viewportNode = this.viewport.node();
    if (!viewportNode) throw new Error("Viewport element #viewport not found.");

    const rect = viewportNode.getBoundingClientRect();
    const transform = this.getZoomTransform();

    const width = rect.width / transform.k;
    const height = rect.height / transform.k;
    const windowWidth = window.innerWidth / transform.k;
    const windowHeight = window.innerHeight / transform.k;
    const [x0, x1] = getAxisExtent(width, windowWidth);
    const [y0, y1] = getAxisExtent(height, windowHeight);

    return [
      [x0, y0],
      [x1, y1],
    ];
  }

  public getZoomTransform() {
    const node = this.whiteboard.node();
    if (!node) throw new Error("Viewport element #whiteboard not found.");
    return d3Zoom.zoomTransform(node);
  }

  public getTranslatedCoords(x: number, y: number): { x: number; y: number } {
    const transform = this.getZoomTransform();

    return {
      x: (x - transform.x) / transform.k,
      y: (y - transform.y) / transform.k,
    };
  }
}

export default Viewport;
