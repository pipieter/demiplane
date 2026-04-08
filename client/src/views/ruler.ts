import type Grid from "../models/grid";
import type { Point } from "../models/transform";

class RulerView {
  public readonly layer: SVGSVGElement;
  public readonly lineRuler: SVGLineElement;
  public readonly viewport: SVGSVGElement;

  private grid: Grid;
  private start: Point;

  constructor(grid: Grid) {
    this.layer = document.getElementById("ruler-layer") as unknown as SVGSVGElement;
    this.lineRuler = document.getElementById("ruler-line") as unknown as SVGLineElement;
    this.viewport = document.getElementById("viewport") as unknown as SVGSVGElement;

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

    this.lineRuler.setAttribute("x1", this.start.x.toString());
    this.lineRuler.setAttribute("y1", this.start.y.toString());
    this.lineRuler.setAttribute("x2", this.start.x.toString());
    this.lineRuler.setAttribute("y2", this.start.y.toString());
    this.layer.style.display = "block";
    this.lineRuler.style.display = "block";

    this.viewport.addEventListener("mousemove", (evt) => this.update(evt));
  }

  update(evt: MouseEvent) {
    const currentPos = this.grid.getCoordinates(evt);

    this.lineRuler.setAttribute("x2", currentPos.x.toString());
    this.lineRuler.setAttribute("y2", currentPos.y.toString());
  }

  stopRuler() {
    this.viewport.removeEventListener("mousemove", this.update);
    this.lineRuler.style.display = "none";
    this.layer.style.display = "none";
  }
}

export default RulerView;
