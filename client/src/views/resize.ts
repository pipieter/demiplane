import { Listener, ListenerContainer } from "../listener";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type Viewport from "../models/viewport";

interface ResizeViewMap {
  token_transform: Transform;
}

class ResizeViewListeners extends Listener<ResizeViewMap> {
  protected override keys(): (keyof ResizeViewMap)[] {
    return ["token_transform"];
  }
}

class ResizeView extends ListenerContainer<ResizeViewListeners, ResizeViewMap> {
  private grid: Grid;
  private viewport: Viewport;

  private layer: SVGSVGElement;
  private box: SVGRectElement;
  private handles: SVGRectElement[];
  private rotateHandle: SVGCircleElement;
  private rotateLine: SVGLineElement;

  private cursorStartPosition: { x: number; y: number };
  private elementStartSize: DOMRect;
  private direction: string | null;
  private selected: Token[];

  constructor(grid: Grid, viewport: Viewport) {
    super(new ResizeViewListeners());

    this.grid = grid;
    this.viewport = viewport;

    this.layer = document.getElementById("whiteboard-resize") as unknown as SVGSVGElement;
    this.box = document.getElementById("resize-box") as unknown as SVGRectElement;
    this.handles = [...document.querySelectorAll<SVGRectElement>(".resize-handle")];
    this.rotateHandle = document.getElementById("rotate-handle") as unknown as SVGCircleElement;
    this.rotateLine = document.getElementById("rotate-line") as unknown as SVGLineElement;

    this.cursorStartPosition = { x: 0, y: 0 };
    this.elementStartSize = new DOMRect(0, 0, 0, 0);
    this.direction = null;
    this.selected = [];

    this.handles.forEach((handle) => handle.addEventListener("mousedown", (evt) => this.startResize(evt)));
    this.rotateHandle.addEventListener("mousedown", (evt) => this.startRotate(evt));
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    this.updateBox();
  }

  private updateBox() {
    // Hide if nothing is selected
    if (this.selected.length === 0) {
      this.layer.style.display = "none";
      return;
    }

    // TODO for now only use the first id
    const token = this.selected[0];

    const offset = 0;
    const x = token.x - offset;
    const y = token.y - offset;
    const w = token.w + offset * 2;
    const h = token.h + offset * 2;
    const angle = token.r;

    this.layer.style.display = "block";
    this.box.setAttribute("x", x.toString());
    this.box.setAttribute("y", y.toString());
    this.box.setAttribute("width", w.toString());
    this.box.setAttribute("height", h.toString());
    this.box.setAttribute("transform", `rotate(${angle} 0 0)`);

    // Position the handles
    const size = 8;
    const centerX = token.x + token.w / 2;
    const centerY = token.y + token.h / 2;
    this.setHandle("handle-tr", x - size / 2, y - size / 2, size, angle, centerX, centerY);
    this.setHandle("handle-tl", x + w - size / 2, y - size / 2, size, angle, centerX, centerY);
    this.setHandle("handle-bl", x - size / 2, y + h - size / 2, size, angle, centerX, centerY);
    this.setHandle("handle-br", x + w - size / 2, y + h - size / 2, size, angle, centerX, centerY);
    this.setRotateHandle(token, centerX, centerY, angle);
  }

  private setHandle(
    id: string,
    x: number,
    y: number,
    size: number,
    angle: number = 0,
    centerX?: number,
    centerY?: number,
  ) {
    const h = document.getElementById(id);
    if (!h) return;
    h.setAttribute("x", x.toString());
    h.setAttribute("y", y.toString());
    h.setAttribute("width", size.toString());
    h.setAttribute("height", size.toString());

    if (centerX !== undefined && centerY !== undefined) {
      h.setAttribute("transform", `rotate(${angle} ${centerX - x - size / 2} ${centerY - y - size / 2})`);
    } else {
      h.removeAttribute("transform");
    }
  }

  private rotatePoint(px: number, py: number, cx: number, cy: number, angleDeg: number) {
    const angle = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = px - cx;
    const dy = py - cy;

    const x = cx + dx * cos - dy * sin;
    const y = cy + dx * sin + dy * cos;

    return { x, y };
  }

  setRotateHandle(token: Token, centerX: number, centerY: number, angle: number) {
    if (!this.rotateHandle) return;

    const topCenterX = token.x + token.w / 2;
    const topCenterY = token.y - 20; // offset

    const rotated = this.rotatePoint(topCenterX, topCenterY, centerX, centerY, angle);
    this.rotateHandle.setAttribute("cx", rotated.x.toString());
    this.rotateHandle.setAttribute("cy", rotated.y.toString());

    if (this.rotateLine) {
      this.rotateLine.setAttribute("x1", centerX.toString());
      this.rotateLine.setAttribute("y1", centerY.toString());
      this.rotateLine.setAttribute("x2", rotated.x.toString());
      this.rotateLine.setAttribute("y2", rotated.y.toString());
    }
  }

  private startResize(e: MouseEvent) {
    e.stopPropagation();
    const target = e.target as SVGElement;
    this.direction = target.dataset.dir ?? null;

    const token = this.selected[0];

    this.cursorStartPosition = this.viewport.getTranslatedCoords(e.offsetX, e.offsetY);
    this.elementStartSize = new DOMRect(token.x, token.y, token.w, token.h);
    document.onmousemove = (evt) => this.resize(evt);
    document.onmouseup = () => this.stopResize();
  }

  private stopResize() {
    document.onmousemove = null;
    document.onmouseup = null;
    this.direction = null;
  }
  private getSnapStep(size: number, gridSize: number, minSize: number) {
    let step = gridSize;

    while (step / 2 >= minSize && size < step) {
      if (size <= minSize) break;
      step /= 2;
    }

    return step;
  }

  private snapToStep(value: number, offset: number, step: number) {
    return Math.round((value - offset) / step) * step + offset;
  }

  private resize(e: MouseEvent, minSize: number = 8) {
    if (this.selected.length <= 0 || !this.direction) return;

    const token = this.selected[0];
    this.updateBox();

    let x = token.x;
    let y = token.y;
    let width = token.w;
    let height = token.h;

    const current = this.viewport.getTranslatedCoords(e.offsetX, e.offsetY);

    const dx = current.x - this.cursorStartPosition.x;
    const dy = current.y - this.cursorStartPosition.y;

    if (this.direction.includes("r")) width = this.elementStartSize.width + dx;
    if (this.direction.includes("l")) {
      width = this.elementStartSize.width - dx;
      x = this.elementStartSize.x + (this.elementStartSize.width - width);
    }
    if (this.direction.includes("b")) height = this.elementStartSize.height + dy;
    if (this.direction.includes("t")) {
      height = this.elementStartSize.height - dy;
      y = this.elementStartSize.y + (this.elementStartSize.height - height);
    }

    if (e.shiftKey) {
      const stepX = this.getSnapStep(width, this.grid.size, minSize);
      const stepY = this.getSnapStep(height, this.grid.size, minSize);

      if (this.direction.includes("r")) {
        const snappedX = this.snapToStep(x + width, this.grid.offset.x, stepX);
        width = snappedX - x;
      }

      if (this.direction.includes("l")) {
        const snappedX = this.snapToStep(x, this.grid.offset.x, stepX);
        width = width + (x - snappedX);
        x = snappedX;
      }

      if (this.direction.includes("b")) {
        const snappedY = this.snapToStep(y + height, this.grid.offset.y, stepY);
        height = snappedY - y;
      }

      if (this.direction.includes("t")) {
        const snappedY = this.snapToStep(y, this.grid.offset.y, stepY);
        height = height + (y - snappedY);
        y = snappedY;
      }
    }

    // Limit minimum width & height
    if (width <= minSize) {
      x = token.x; // Prevent accidental shifting
      width = minSize;
    }
    if (height <= minSize) {
      y = token.y; // Prevent accidental shifting
      height = minSize;
    }

    this.emit("token_transform", {
      id: token.id,
      x,
      y,
      w: width,
      h: height,
      r: token.r,
    });
  }

  private startRotate(e: MouseEvent) {
    e.stopPropagation();
    this.cursorStartPosition = this.viewport.getTranslatedCoords(e.offsetX, e.offsetY);
    document.onmousemove = (evt) => this.rotate(evt);
    document.onmouseup = () => this.stopRotate();
  }

  private stopRotate() {
    document.onmousemove = null;
    document.onmouseup = null;
  }

  private rotate(e: MouseEvent) {
    const token = this.selected[0];

    const current = this.viewport.getTranslatedCoords(e.offsetX, e.offsetY);
    const center = this.viewport.getTranslatedCoords(token.x + token.w / 2, token.y + token.h / 2);
    const dx = current.x - center.x;
    const dy = current.y - center.y;

    let r = Math.atan2(dy, dx);
    r = r * (180 / Math.PI); // Radians to degrees
    r += 90; // 90 degree offset, so the top of the token is 0.
    r = Math.floor(r); // Make behavior "snappier"

    this.updateBox();
    this.emit("token_transform", {
      id: token.id,
      x: token.x,
      y: token.y,
      w: token.w,
      h: token.h,
      r,
    });
  }
}

export default ResizeView;
