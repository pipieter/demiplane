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

    document.onmousemove = (evt) => this.resize(evt);
    document.onmouseup = () => this.stopResize();
  }

  private stopResize() {
    document.onmousemove = null;
    document.onmouseup = null;
    this.direction = null;
  }

  // TODO this is the same as in TokenDrawView, and a common util method would be better
  private getCoordinates(evt: MouseEvent) {
    let { x, y } = this.viewport.getTranslatedCoords(evt.offsetX, evt.offsetY);
    if (evt.shiftKey) {
      const gridLocked = this.grid.getLockedCoordinates(x, y);
      x = gridLocked.x;
      y = gridLocked.y;
    }
    return { x, y };
  }

  private resize(evt: MouseEvent) {
    if (this.selected.length <= 0 || !this.direction) return;

    this.updateBox();

    const token = this.selected[0];
    let x = token.x;
    let y = token.y;
    let w = token.w;
    let h = token.h;

    const target = this.getCoordinates(evt);
    const dx = target.x - token.x;
    const dy = target.y - token.y;

    if (this.direction.includes("r")) {
      w = dx;
    }

    if (this.direction.includes("l")) {
      x = target.x;
      w = token.w - dx;
    }
    if (this.direction.includes("b")) {
      h = dy;
    }
    if (this.direction.includes("t")) {
      y = target.y;
      h = token.h - dy;
    }

    this.emit("token_transform", {
      id: token.id,
      x,
      y,
      w,
      h,
      r: token.r,
    });
  }

  private startRotate(e: MouseEvent) {
    e.stopPropagation();
    document.onmousemove = (evt) => this.rotate(evt);
    document.onmouseup = () => this.stopRotate();
  }

  private stopRotate() {
    document.onmousemove = null;
    document.onmouseup = null;
  }

  private rotate(evt: MouseEvent) {
    const token = this.selected[0];

    const current = this.viewport.getTranslatedCoords(evt.offsetX, evt.offsetY);
    const centerX = token.x + token.w / 2;
    const centerY = token.y + token.h / 2;
    const dx = current.x - centerX;
    const dy = current.y - centerY;

    let r = Math.atan2(dy, dx);
    r = r * (180 / Math.PI); // Radians to degrees

    if (evt.shiftKey) {
      r = Math.round(r / 15) * 15; // Snap by 15 degrees
    } else {
      r = Math.floor(r); // Makes behavior "snappier"
    }

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
