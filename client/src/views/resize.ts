import Listeners from "../listener";
import type Grid from "../models/grid";
import type { Transform } from "../models/transform";
import { viewport } from "../whiteboard/viewport";
import View from "./view";

interface ResizeViewMap {
  token_transform: Transform;
}

class ResizeViewListeners extends Listeners<ResizeViewMap> {
  protected override keys(): (keyof ResizeViewMap)[] {
    return ["token_transform"];
  }
}

class ResizeView extends View<ResizeViewListeners, ResizeViewMap> {
  private grid: Grid;

  private layer: SVGSVGElement;
  private box: SVGRectElement;
  private handles: SVGRectElement[];

  private cursorStartPosition: { x: number; y: number };
  private elementStartSize: DOMRect;
  private direction: string | null;
  private selected: string[];

  constructor(grid: Grid) {
    super(new ResizeViewListeners());

    this.grid = grid;

    this.layer = document.getElementById("whiteboard-resize") as unknown as SVGSVGElement;
    this.box = document.getElementById("resize-box") as unknown as SVGRectElement;
    this.handles = [...document.querySelectorAll<SVGRectElement>(".resize-handle")];

    this.cursorStartPosition = { x: 0, y: 0 };
    this.elementStartSize = new DOMRect(0, 0, 0, 0);
    this.direction = null;
    this.selected = [];

    this.handles.forEach((handle) => handle.addEventListener("mousedown", (evt) => this.start(evt)));
  }

  public setSelected(ids: string[]) {
    this.selected = [...ids];
    this.updateBox();
  }

  private updateBox() {
    // Hide if nothing is selected
    if (this.selected.length === 0) {
      this.layer.style.display = "none";
      return;
    }

    // TODO for now only use the first id
    const element = this.elements()[0];
    const box = element.getBBox();

    const offset = 0;
    box.x -= offset;
    box.y -= offset;
    box.width += offset * 2;
    box.height += offset * 2;

    this.layer.style.display = "block";
    this.box.setAttribute("x", box.x.toString());
    this.box.setAttribute("y", box.y.toString());
    this.box.setAttribute("width", box.width.toString());
    this.box.setAttribute("height", box.height.toString());

    // Position the handles
    const size = 8;
    this.setHandle("handle-tr", box.x - size / 2, box.y - size / 2, size);
    this.setHandle("handle-tl", box.x + box.width - size / 2, box.y - size / 2, size);
    this.setHandle("handle-bl", box.x - size / 2, box.y + box.height - size / 2, size);
    this.setHandle("handle-br", box.x + box.width - size / 2, box.y + box.height - size / 2, size);
  }

  private setHandle(id: string, x: number, y: number, size: number) {
    const h = document.getElementById(id);
    if (!h) return;
    h.setAttribute("x", x.toString());
    h.setAttribute("y", y.toString());
    h.setAttribute("width", size.toString());
    h.setAttribute("height", size.toString());
  }

  private elements(): SVGGraphicsElement[] {
    return this.selected.map((id) => document.getElementById(id) as unknown as SVGGraphicsElement);
  }

  private start(e: MouseEvent) {
    e.stopPropagation();
    const target = e.target as SVGElement;
    this.direction = target.dataset.dir ?? null;

    const element = this.elements()[0];

    this.cursorStartPosition = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);
    this.elementStartSize = element.getBBox();
    document.onmousemove = (evt) => this.resize(evt);
    document.onmouseup = () => this.stop();
  }

  private stop() {
    document.onmousemove = null;
    document.onmouseup = null;
    this.direction = null;
  }

  private resize(e: MouseEvent, minSize: number = 8) {
    const elements = this.elements();

    if (elements.length <= 0 || !this.direction) return;
    const box = elements[0].getBBox();
    this.updateBox();

    let x = box.x;
    let y = box.y;
    let width = box.width;
    let height = box.height;

    const current = viewport.getZoomTranslatedCoords(e.offsetX, e.offsetY);

    const dx = current.x - this.cursorStartPosition.x;
    const dy = current.y - this.cursorStartPosition.y;

    switch (this.direction) {
      case "br":
        width = this.elementStartSize.width + dx;
        height = this.elementStartSize.height + dy;
        break;

      case "tr":
        width = this.elementStartSize.width + dx;
        height = this.elementStartSize.height - dy;
        y = this.elementStartSize.y + (this.elementStartSize.height - height);
        break;

      case "bl":
        width = this.elementStartSize.width - dx;
        height = this.elementStartSize.height + dy;
        x = this.elementStartSize.x + (this.elementStartSize.width - width);
        break;

      case "tl":
        width = this.elementStartSize.width - dx;
        height = this.elementStartSize.height - dy;
        x = this.elementStartSize.x + (this.elementStartSize.width - width);
        y = this.elementStartSize.y + (this.elementStartSize.height - height);
        break;
    }

    if (e.shiftKey) {
      function getSnapStep(size: number, gridSize: number, minSize: number) {
        let step = gridSize;

        while (step / 2 >= minSize && size < step) {
          if (size <= minSize) break;
          step /= 2;
        }

        return step;
      }

      function snapToStep(value: number, offset: number, step: number) {
        return Math.round((value - offset) / step) * step + offset;
      }

      const stepX = getSnapStep(width, this.grid.size, minSize);
      const stepY = getSnapStep(height, this.grid.size, minSize);

      if (this.direction.includes("r")) {
        const snappedX = snapToStep(x + width, this.grid.offset.x, stepX);
        width = snappedX - x;
      }

      if (this.direction.includes("l")) {
        const snappedX = snapToStep(x, this.grid.offset.x, stepX);
        const newX = snappedX;
        width = width + (x - newX);
        x = newX;
      }

      if (this.direction.includes("b")) {
        const snappedY = snapToStep(y + height, this.grid.offset.y, stepY);
        height = snappedY - y;
      }

      if (this.direction.includes("t")) {
        const snappedY = snapToStep(y, this.grid.offset.y, stepY);
        const newY = snappedY;
        height = height + (y - newY);
        y = newY;
      }
    }

    // Limit minimum width & height
    if (width <= minSize) {
      x = box.x; // Prevent accidental shifting
      width = minSize;
    }
    if (height <= minSize) {
      y = box.y; // Prevent accidental shifting
      height = minSize;
    }

    this.listeners.emit("token_transform", {
      id: elements[0].getAttribute("id")!,
      x,
      y,
      w: width,
      h: height,
    });
  }
}

export default ResizeView;
