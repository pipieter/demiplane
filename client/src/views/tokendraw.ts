import { Listener } from "../listener";
import type Grid from "../models/grid";
import { util } from "../util";

interface TokenDrawViewMap {
  circle_create: { x: number; y: number; w: number; h: number; border: number | null; color: string };
  rectangle_create: { x: number; y: number; w: number; h: number; border: number | null; color: string };
  image_create: { base64: string; x: number; y: number; w: number; h: number };
  line_create: { x1: number; y1: number; x2: number; y2: number; stroke: number; color: string };
}

type TokenDrawType = "circle" | "rectangle" | "freedraw" | "line";

class TokenDrawView extends Listener<TokenDrawViewMap> {
  private grid: Grid;

  public readonly layer: SVGSVGElement;
  public readonly circle: SVGCircleElement;
  public readonly rectangle: SVGRectElement;
  public readonly line: SVGLineElement;
  public readonly freedraw: SVGPathElement;
  public readonly cursor: SVGCircleElement;

  public readonly circleButton: HTMLButtonElement;
  public readonly rectangleButton: HTMLButtonElement;
  public readonly lineButton: HTMLButtonElement;
  public readonly freedrawButton: HTMLButtonElement;
  public readonly tokenUploadInput: HTMLInputElement;
  public readonly colorInput: HTMLInputElement;
  public readonly drawButtons: Map<string, HTMLButtonElement>;

  public readonly borderCheckbox: HTMLInputElement;
  public readonly borderNumber: HTMLInputElement;

  private type: TokenDrawType | null;
  private mouseDown: boolean;
  private freedrawPoints: [number, number][];
  private readonly start: { x: number; y: number };
  private readonly current: { x: number; y: number };

  constructor(grid: Grid) {
    super();

    this.grid = grid;

    this.layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
    this.cursor = document.getElementById("whiteboard-drawing-cursor") as unknown as SVGCircleElement;
    this.circle = document.getElementById("whiteboard-drawing-circle") as unknown as SVGCircleElement;
    this.rectangle = document.getElementById("whiteboard-drawing-rectangle") as unknown as SVGRectElement;
    this.line = document.getElementById("whiteboard-drawing-line") as unknown as SVGLineElement;
    this.freedraw = document.getElementById("whiteboard-drawing-free") as unknown as SVGPathElement;

    this.circleButton = document.getElementById("begin-circle-button") as HTMLButtonElement;
    this.rectangleButton = document.getElementById("begin-rect-button") as HTMLButtonElement;
    this.lineButton = document.getElementById("begin-line-button") as HTMLButtonElement;
    this.freedrawButton = document.getElementById("begin-drawing-button") as HTMLButtonElement;
    this.drawButtons = new Map([
      ["circle", this.circleButton],
      ["rectangle", this.rectangleButton],
      ["line", this.lineButton],
      ["freedraw", this.freedrawButton],
    ]);

    this.tokenUploadInput = document.getElementById("upload-token-button") as HTMLInputElement;
    this.colorInput = document.getElementById("draw-color-input") as HTMLInputElement;

    this.borderCheckbox = document.getElementById("draw-border-checkbox") as HTMLInputElement;
    this.borderNumber = document.getElementById("draw-border-number") as HTMLInputElement;

    this.type = null;
    this.mouseDown = false;
    this.start = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };
    this.freedrawPoints = [];

    this.circleButton.addEventListener("click", () => this.begin("circle"));
    this.rectangleButton.addEventListener("click", () => this.begin("rectangle"));
    this.lineButton.addEventListener("click", () => this.begin("line"));
    this.freedrawButton.addEventListener("click", () => this.begin("freedraw"));
    this.tokenUploadInput.addEventListener("change", (evt) => {
      this.begin(null); // Unselect current drawing on toke upload
      const file = (evt.target as HTMLInputElement).files?.item(0);
      if (!file) throw "Could not open file.";
      this.uploadToken(file);
    });

    this.colorInput.addEventListener("input", () => this.updateColors());
    this.updateColors();
  }

  private begin(type: TokenDrawType | null) {
    // Clear all button styling
    [...this.drawButtons.values()].forEach((button) => button.classList.remove("selected"));

    if (type === this.type) {
      type = null; // unselect
    }

    if (type === null) {
      this.type = null;
      this.mouseDown = false;
      this.cursor.style.display = "none";
      this.circle.style.display = "none";
      this.rectangle.style.display = "none";
      this.line.style.display = "none";
      this.freedraw.style.display = "none";
      this.layer.style.display = "none";
      this.layer.onmousedown = null;
      this.layer.onmouseup = null;
      this.layer.onmousemove = null;
      document.onkeydown = null;
      this.grid.viewport.enable();
      return;
    }

    this.type = type;
    this.grid.viewport.disable();
    this.mouseDown = false;
    this.cursor.style.display = "";
    this.layer.style.display = "";
    this.layer.style.pointerEvents = "";
    this.drawButtons.get(type)?.classList.add("selected");

    document.onkeydown = (evt) => this.onkeydown(evt);
    this.layer.onmouseup = () => this.onmouseup();
    this.layer.onmousedown = (evt) => this.onmousedown(evt);
    this.layer.onmousemove = (evt) => this.onmousemove(evt);

    this.hideDrawingLayers();
  }

  private hideDrawingLayers() {
    // Hide the drawing layers so they aren't visible until the user starts drawing again

    this.circle.style.display = "none";
    this.circle.setAttribute("cx", "0");
    this.circle.setAttribute("cy", "0");
    this.circle.setAttribute("rx", "0");
    this.circle.setAttribute("ry", "0");

    this.rectangle.style.display = "none";
    this.rectangle.setAttribute("x", "0");
    this.rectangle.setAttribute("y", "0");
    this.rectangle.setAttribute("width", "0");
    this.rectangle.setAttribute("height", "0");

    this.line.style.display = "none";
    this.line.setAttribute("x1", "0");
    this.line.setAttribute("y1", "0");
    this.line.setAttribute("x2", "0");
    this.line.setAttribute("y2", "0");

    this.freedraw.style.display = "none";
    this.freedrawPoints = [];
    this.updateFreedrawLine();
  }

  private onmousedown(evt: MouseEvent) {
    // Cancel on right click
    if (evt.buttons & 2) {
      return this.begin(null);
    }

    // Begin drawing on left click
    if (evt.buttons & 1) {
      const { x, y } = this.grid.getCoordinates(evt);

      this.mouseDown = true;
      this.start.x = x;
      this.start.y = y;
      this.current.x = x;
      this.current.y = y;

      switch (this.type) {
        case "circle":
          this.circle.style.display = "";
          break;

        case "rectangle":
          this.rectangle.style.display = "";
          break;

        case "line":
          this.line.style.display = "";
          break;

        case "freedraw":
          this.freedraw.style.display = "";
          this.freedrawPoints = [[x, y]];
          this.updateFreedrawLine();
          break;
      }
      return;
    }
  }

  private onmousemove(evt: MouseEvent) {
    const { x, y } = this.grid.getCoordinates(evt);
    this.updateCursor(x, y);

    if (!this.mouseDown) return;

    this.current.x = x;
    this.current.y = y;

    switch (this.type) {
      case "circle": {
        const cx = (this.start.x + this.current.x) / 2;
        const cy = (this.start.y + this.current.y) / 2;
        const rx = Math.abs((this.start.x - this.current.x) / 2);
        const ry = Math.abs((this.start.y - this.current.y) / 2);
        this.circle.setAttribute("cx", cx.toString());
        this.circle.setAttribute("cy", cy.toString());
        this.circle.setAttribute("rx", rx.toString());
        this.circle.setAttribute("ry", ry.toString());
        break;
      }

      case "rectangle": {
        const x = Math.min(this.start.x, this.current.x);
        const y = Math.min(this.start.y, this.current.y);
        const w = Math.abs(this.start.x - this.current.x);
        const h = Math.abs(this.start.y - this.current.y);
        this.rectangle.setAttribute("x", x.toString());
        this.rectangle.setAttribute("y", y.toString());
        this.rectangle.setAttribute("width", w.toString());
        this.rectangle.setAttribute("height", h.toString());
        break;
      }

      case "line": {
        const x1 = Math.abs(this.start.x);
        const x2 = Math.abs(this.current.x);
        const y1 = Math.abs(this.start.y);
        const y2 = Math.abs(this.current.y);
        this.line.setAttribute("x1", x1.toString());
        this.line.setAttribute("y1", y1.toString());
        this.line.setAttribute("x2", x2.toString());
        this.line.setAttribute("y2", y2.toString());
        this.line.setAttribute("stroke-width", `${this.getLineStrokeWidth()}px`);
        break;
      }

      case "freedraw": {
        this.freedraw.setAttribute("stroke-width", `${this.getLineStrokeWidth()}px`);
        const last = this.freedrawPoints.at(-1);
        if (last && !this.grid.shouldGridlock(evt)) {
          const s = 0.5;
          const nx = last[0] + (x - last[0]) * s;
          const ny = last[1] + (y - last[1]) * s;

          if (Math.hypot(nx - last[0], ny - last[1]) > 1) {
            this.freedrawPoints.push([nx, ny]);
          }
        } else {
          this.freedrawPoints.push([x, y]);
        }

        this.updateFreedrawLine();
        break;
      }
    }
  }

  private onmouseup() {
    switch (this.type) {
      case "circle": {
        const x = Math.min(this.start.x, this.current.x);
        const y = Math.min(this.start.y, this.current.y);
        const w = Math.abs(this.start.x - this.current.x);
        const h = Math.abs(this.start.y - this.current.y);
        const color = this.colorInput.value;
        const border = this.getBorder();
        this.emit("circle_create", { x, y, w, h, border, color });
        break;
      }

      case "rectangle": {
        const x = Math.min(this.start.x, this.current.x);
        const y = Math.min(this.start.y, this.current.y);
        const w = Math.abs(this.start.x - this.current.x);
        const h = Math.abs(this.start.y - this.current.y);
        const color = this.colorInput.value;
        const border = this.getBorder();
        this.emit("rectangle_create", { x, y, w, h, border, color });
        break;
      }

      case "line": {
        const x1 = Math.abs(this.start.x);
        const y1 = Math.abs(this.start.y);
        const x2 = Math.abs(this.current.x);
        const y2 = Math.abs(this.current.y);
        const color = this.colorInput.value;
        const stroke = this.getLineStrokeWidth();
        this.emit("line_create", { x1, y1, x2, y2, stroke, color });
        break;
      }

      case "freedraw": {
        const bbox = this.freedraw.getBBox();
        const x = bbox.x;
        const y = bbox.y;
        const width = bbox.width;
        const height = bbox.height;
        const lineWidth = this.getLineStrokeWidth();
        const color = this.colorInput.value;
        const rasterized = util.rasterizeLine(
          structuredClone(this.freedrawPoints),
          x,
          y,
          width,
          height,
          lineWidth,
          color,
        );
        this.emit("image_create", rasterized);
        this.freedrawPoints = [];
        break;
      }
    }

    this.mouseDown = false;
    this.hideDrawingLayers();
  }

  private onkeydown(evt: KeyboardEvent) {
    if (evt.key === "Escape") this.begin(null);
  }

  private updateCursor(x: number, y: number) {
    this.cursor.setAttribute("cx", x.toString());
    this.cursor.setAttribute("cy", y.toString());
  }

  private updateFreedrawLine() {
    if (this.freedrawPoints.length === 0) {
      this.freedraw.setAttribute("d", "M 0 0");
      return;
    }

    const combined = "M " + this.freedrawPoints.map(([x, y]) => `${x} ${y}`).join(" L ");
    this.freedraw.setAttribute("d", combined);
  }

  private getBorder(): number | null {
    if (!this.borderCheckbox.checked) return null;
    return parseInt(this.borderNumber.value);
  }

  private getLineStrokeWidth(): number {
    return parseInt(this.borderNumber.value) ?? 4;
  }

  private updateColors() {
    const color = this.colorInput.value ?? "black";
    document.documentElement.style.setProperty("--draw-color", color);
  }

  private async uploadToken(file: File) {
    const base64 = await util.readBase64(file);
    if (!base64) throw "Could not read file.";

    const x = 0; // Top left corner
    const y = 0;
    const w = this.grid.size;
    const h = this.grid.size;

    this.emit("image_create", { base64, x, y, w, h });
  }
}

export default TokenDrawView;
