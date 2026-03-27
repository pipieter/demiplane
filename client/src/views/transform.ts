import { TokenListenerContainer } from "../listeners";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Point } from "../models/transform";
import type Viewport from "../models/viewport";
import { util } from "../util";

class TransformView extends TokenListenerContainer {
  private grid: Grid;
  private viewport: Viewport;

  private container: HTMLDivElement;
  private dragOffset: Point | null = null;

  private layer: SVGSVGElement;
  private box: SVGRectElement;
  private handles: SVGRectElement[];
  private rotateHandle: SVGCircleElement;
  private rotateLine: SVGLineElement;

  private lineLayer: SVGSVGElement;
  private line: SVGLineElement;

  private direction: string | null;
  private selected: Token[];

  constructor(grid: Grid, viewport: Viewport) {
    super();

    this.grid = grid;
    this.viewport = viewport;

    this.container = document.getElementById("whiteboard-container") as HTMLDivElement;
    this.layer = document.getElementById("whiteboard-resize") as unknown as SVGSVGElement;
    this.box = document.getElementById("resize-box") as unknown as SVGRectElement;
    this.handles = [...document.querySelectorAll<SVGRectElement>(".resize-handle")];
    this.rotateHandle = document.getElementById("rotate-handle") as unknown as SVGCircleElement;
    this.rotateLine = document.getElementById("rotate-line") as unknown as SVGLineElement;

    this.lineLayer = document.getElementById("whiteboard-resize-line") as unknown as SVGSVGElement;
    this.line = document.getElementById("resize-line") as unknown as SVGLineElement;

    this.direction = null;
    this.selected = [];

    this.handles.forEach((handle) => handle.addEventListener("mousedown", (evt) => this.startResize(evt)));
    this.rotateHandle.addEventListener("mousedown", (evt) => this.startRotate(evt));
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;
    element.onmousedown = () => {
      this.emit("tokens_select", [token]);
      document.onmousemove = (evt) => this.move(evt);
      document.onmouseup = () => this.finishTransform();
    };
  }

  private move(event: MouseEvent) {
    if (this.selected.length === 0) return;

    // TODO only use the first selected for now
    const token = this.selected[0];
    const cursor = this.viewport.getTranslatedCoords(event.offsetX, event.offsetY);

    if (!this.dragOffset)
      this.dragOffset = {
        x: cursor.x - token.x,
        y: cursor.y - token.y,
      };

    let x = cursor.x - this.dragOffset.x;
    let y = cursor.y - this.dragOffset.y;
    const w = token.w;
    const h = token.h;

    if (event.shiftKey) {
      // On grid-lock we want to snap to center, this feel better to use.
      this.dragOffset = { x: token.w / 2, y: token.h / 2 };
      const locked = this.grid.getLockedCoordinates(cursor.x, cursor.y);

      const snapDx = locked.x - (token.x + (this.isLineTransform() ? 0 : token.w / 2));
      const snapDy = locked.y - (token.y + (this.isLineTransform() ? 0 : token.h / 2));

      x = token.x + snapDx;
      y = token.y + snapDy;
    }

    if (!util.mouseOnElement(event, this.container)) return;

    this.emit("token_transform", { id: token.id, x, y, w, h, r: token.r });
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    this.updateBox();
  }

  private updateBox() {
    // Hide if nothing is selected
    if (this.selected.length === 0) {
      this.layer.style.display = "none";
      this.lineLayer.style.display = "none";
      return;
    }

    // TODO for now only use the first id
    const token = this.selected[0];
    const angle = token.r;
    const handleSize = 8;
    const centerX = token.x + token.w / 2;
    const centerY = token.y + token.h / 2;

    if (!this.isLineTransform()) {
      const offset = 0;
      const x = token.x - offset;
      const y = token.y - offset;
      const w = token.w + offset * 2;
      const h = token.h + offset * 2;

      this.layer.style.display = "block";
      this.box.setAttribute("x", x.toString());
      this.box.setAttribute("y", y.toString());
      this.box.setAttribute("width", w.toString());
      this.box.setAttribute("height", h.toString());
      this.box.setAttribute("transform", `rotate(${angle} 0 0)`);

      // Position the handles
      this.setHandle("handle-tr", x, y, handleSize, angle, centerX, centerY);
      this.setHandle("handle-tl", x + w, y, handleSize, angle, centerX, centerY);
      this.setHandle("handle-bl", x, y + h, handleSize, angle, centerX, centerY);
      this.setHandle("handle-br", x + w, y + h, handleSize, angle, centerX, centerY);
      this.setRotateHandle(token, centerX, centerY, angle);
    } else {
      // Line markings
      const x2 = token.x + token.w;
      const y2 = token.y + token.h;
      this.lineLayer.style.display = "block";
      this.line.setAttribute("x1", token.x.toString());
      this.line.setAttribute("y1", token.y.toString());
      this.line.setAttribute("x2", x2.toString());
      this.line.setAttribute("y2", y2.toString());
      this.setHandle("handle-p1", token.x, token.y, handleSize, 0, centerX, centerY);
      this.setHandle("handle-p2", x2, y2, handleSize, 0, centerX, centerY);
    }
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
    x -= size / 2;
    y -= size / 2;
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

    const topCenterX = token.x + token.w + 20;
    const topCenterY = token.y + token.h / 2;

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
    document.onmouseup = () => this.finishTransform();
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

    const token = this.selected[0];
    const target = this.getCoordinates(evt);

    let { x, y, w, h } = token;

    if (!this.isLineTransform()) {
      const centerX = token.x + token.w / 2;
      const centerY = token.y + token.h / 2;

      // By rotating the mouse position BACKWARDS by the object's angle (-token.r),
      // we can treat the object as if it has 0 rotation.
      const localMouse = this.rotatePoint(target.x, target.y, centerX, centerY, -token.r);

      if (this.direction.includes("r")) {
        w = localMouse.x - token.x;
      }
      if (this.direction.includes("l")) {
        x = localMouse.x;
        w = token.w + (token.x - localMouse.x);
      }
      if (this.direction.includes("b")) {
        h = localMouse.y - token.y;
      }
      if (this.direction.includes("t")) {
        y = localMouse.y;
        h = token.h + (token.y - localMouse.y);
      }

      const newCenterX = x + w / 2;
      const newCenterY = y + h / 2;

      // CSS 'transform-origin: center' expects the object's x/y to be
      // positioned such that the rotation happens around the NEW center.
      // We rotate the new center back to the original orientation.
      const rotatedCenter = this.rotatePoint(newCenterX, newCenterY, centerX, centerY, token.r);

      x = rotatedCenter.x - w / 2;
      y = rotatedCenter.y - h / 2;
    } else {
      if (this.direction === "p1") {
        const x2 = token.x + token.w;
        const y2 = token.y + token.h;

        x = target.x;
        y = target.y;
        w = x2 - x;
        h = y2 - y;
      } else if (this.direction === "p2") {
        w = target.x - token.x;
        h = target.y - token.y;
      }
    }

    this.emit("token_transform", {
      id: token.id,
      x,
      y,
      w,
      h,
      r: token.r,
    });

    this.updateBox();
  }

  private startRotate(e: MouseEvent) {
    e.stopPropagation();
    document.onmousemove = (evt) => this.rotate(evt);
    document.onmouseup = () => this.finishTransform();
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

  private finishTransform() {
    const token = this.selected[0];
    if (token)
      this.emit("token_transform_finish", { id: token.id, x: token.x, y: token.y, w: token.w, h: token.h, r: token.r });

    document.onmousemove = null;
    document.onmouseup = null;
    this.direction = null;
    this.dragOffset = null;
  }

  private isLineTransform(): boolean {
    return this.selected.length == 1 && this.selected[0].type == "line";
  }
}

export default TransformView;
