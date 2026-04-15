import type Grid from "../models/grid";
import type { Point } from "../models/transform";

class RulerView {
  public readonly layer: SVGSVGElement;
  public readonly viewport: SVGSVGElement;
  public readonly lineRuler: SVGLineElement;
  public readonly rulerLengthText: SVGTextElement;

  private grid: Grid;
  private start: Point;

  constructor(grid: Grid) {
    this.layer = document.getElementById("ruler-layer") as unknown as SVGSVGElement;
    this.viewport = document.getElementById("viewport") as unknown as SVGSVGElement;

    this.lineRuler = document.getElementById("ruler-line") as unknown as SVGLineElement;
    this.rulerLengthText = document.getElementById("ruler-length-text") as unknown as SVGTextElement;

    this.grid = grid;
    this.start = { x: 0, y: 0 };

    this.viewport.addEventListener("mousedown", (evt) => {
      this.startRuler(evt);
    });
    this.viewport.addEventListener("mouseup", () => {
      this.stopRuler();
    });
  }

  startRuler(evt: MouseEvent) {
    if (evt.buttons !== 4) return;
    evt.preventDefault();

    this.start = this.grid.getCoordinates(evt);
    this.layer.addEventListener("mousemove", (event) => this.update(event));

    const x = this.start.x.toString();
    const y = this.start.y.toString();
    this.lineRuler.setAttribute("x1", x);
    this.lineRuler.setAttribute("y1", y);
    this.lineRuler.setAttribute("x2", x);
    this.lineRuler.setAttribute("y2", y);
    this.rulerLengthText.setAttribute("x", x);
    this.rulerLengthText.setAttribute("y", y);
    this.rulerLengthText.textContent = "";

    this.layer.style.display = "block";

    this.viewport.addEventListener("mousemove", (evt) => this.update(evt));
  }

  update(evt: MouseEvent) {
    const { x, y } = this.grid.getCoordinates(evt);

    this.lineRuler.setAttribute("x2", x.toString());
    this.lineRuler.setAttribute("y2", y.toString());

    const offsetX = x > this.start.x ? 6 : -6;
    const textAnchor = x > this.start.x ? "start" : "end";
    this.rulerLengthText.setAttribute("x", (x + offsetX).toString());
    this.rulerLengthText.setAttribute("y", (y + 6).toString());
    this.rulerLengthText.setAttribute("text-anchor", textAnchor);
    this.rulerLengthText.textContent = `${this.getLineLength(this.start, { x, y }) * 5} Ft.`;
  }

  /**
   * @returns The length of the line in grids.
   */
  private getLineLength(start: Point, end: Point): number {
    const dx = Math.abs(end.x - start.x) / this.grid.size;
    const dy = Math.abs(end.y - start.y) / this.grid.size;

    // D&D 5e: Every second diagonal costs double.
    // Equivalent to: move straight for the difference, then 1.5x for the diagonal overlap.
    const length = Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2);
    return Math.round(length * 10) / 10; // 1 decimal
  }

  stopRuler() {
    this.viewport.removeEventListener("mousemove", (evt) => this.update(evt));
    this.layer.style.display = "none";
  }
}

export default RulerView;
