import Moveable from "moveable";
import { TokenListener } from "../listeners";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Point } from "../models/transform";
import { util } from "../util";

class TransformView extends TokenListener {
  private grid: Grid;
  public readonly container: HTMLDivElement;
  public readonly objectsLayer: SVGElement;
  private dragOffset: Point | null = null;
  private moveable: Moveable;
  private direction: string | null;
  private selected: Token[];

  constructor(grid: Grid) {
    super();

    this.grid = grid;
    this.container = document.getElementById("whiteboard-container") as HTMLDivElement;
    this.objectsLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGElement;
    this.selected = [];
    this.direction = null;

    this.moveable = new Moveable(this.container, {
      target: null,
      container: this.objectsLayer,
      draggable: true,
      resizable: true,
      scalable: false,
      rotatable: true,
      warpable: false,
      pinchable: false, // TODO
      origin: true,
      keepRatio: true,
      edge: false,
      throttleDrag: 0,
      throttleResize: 0,
      throttleScale: 0,
      throttleRotate: 0,
    });

    this.initMoveableListeners();
  }

  private initMoveableListeners() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.moveable.on("drag", ({ target, transform, left, top, right, bottom, delta, dist, clientX, clientY }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        x: left,
        y: top,
      });
      this.moveable.updateRect();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.moveable.on("resize", ({ target, width, height, drag }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        x: drag.beforeTranslate[0],
        y: drag.beforeTranslate[1],
        w: width,
        h: height,
      });
      this.moveable.updateRect();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.moveable.on("rotate", ({ target, beforeRotate }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        r: beforeRotate, // Moveable handles the Atan2 math for you
      });
      this.moveable.updateRect();
    });

    this.moveable.on("renderEnd", () => {
      const token = this.selected[0];
      if (token) {
        this.emit("token_transform", { ...token });
      }
      this.moveable.updateRect();
    });
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
    const cursor = this.grid.getCoordinates(event);

    if (!this.dragOffset)
      this.dragOffset = {
        x: cursor.x - token.x,
        y: cursor.y - token.y,
      };

    // On grid-lock we want to snap to center, this feel better to use.
    if (event.shiftKey) {
      this.dragOffset.x = token.w / 2;
      this.dragOffset.y = token.h / 2;
    }

    const x = cursor.x - this.dragOffset.x;
    const y = cursor.y - this.dragOffset.y;
    const w = token.w;
    const h = token.h;

    if (!util.mouseOnElement(event, this.container)) return;

    this.emit("token_continuous_transform", { id: token.id, name: token.name, x, y, w, h, r: token.r });
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    this.moveable.target = document.getElementById(tokens[0].id);
    this.moveable.updateRect();
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

  private startResize(e: MouseEvent) {
    e.stopPropagation();
    const target = e.target as SVGElement;
    this.direction = target.dataset.dir ?? null;

    document.onmousemove = (evt) => this.resize(evt);
    document.onmouseup = () => this.finishTransform();
  }

  private resize(evt: MouseEvent) {
    if (this.selected.length <= 0 || !this.direction) return;

    const token = this.selected[0];
    const target = this.grid.getCoordinates(evt);

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

    this.emit("token_continuous_transform", {
      id: token.id,
      name: token.name,
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
    document.onmouseup = () => this.finishTransform();
  }

  private rotate(evt: MouseEvent) {
    const token = this.selected[0];

    const current = this.grid.getCoordinates(evt, false);
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

    this.emit("token_continuous_transform", {
      id: token.id,
      name: token.name,
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
      this.emit("token_transform", {
        id: token.id,
        name: token.name,
        x: token.x,
        y: token.y,
        w: token.w,
        h: token.h,
        r: token.r,
      });

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
