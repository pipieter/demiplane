import type { MoveableRefType } from "moveable/declaration/types";
import { TokenListener } from "../listeners";
import { getMoveable } from "../models/moveable";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type Grid from "../models/grid";

class TransformView extends TokenListener {
  private readonly moveable = getMoveable();
  private readonly grid: Grid;
  private selected: Token[];
  private moveableStart: Transform | null = null;

  constructor(grid: Grid) {
    super();

    this.grid = grid;
    this.selected = [];

    this.initMoveableListeners();
  }

  private getSelectedById(id: string): Token | null {
    return this.selected.find((token) => token.id === id) ?? null;
  }

  private initMoveableListeners() {
    this.moveable.on("dragStart", ({ target }) => {
      const token = this.getSelectedById(target.id);
      if (token) this.moveableStart = { ...token };
    });

    this.moveable.on("drag", ({ target, beforeTranslate, inputEvent }) => {
      const token = this.getSelectedById(target.id);
      const start = this.moveableStart;
      if (!token || !start) return;

      const [translateX, translateY] = beforeTranslate;
      const position = this.snapPosition(start.x + translateX, start.y + translateY, inputEvent);

      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: Math.round(position.x),
          y: Math.round(position.y),
        }),
      );
    });

    this.moveable.on("resizeStart", ({ target }) => {
      const token = this.getSelectedById(target.id);
      if (token) this.moveableStart = { ...token };
    });

    this.moveable.on("resize", ({ target, width, height, drag, direction, clientX, clientY, inputEvent }) => {
      const token = this.getSelectedById(target.id);
      const start = this.moveableStart;
      if (!token || !start) return;

      const [translateX, translateY] = drag.beforeTranslate;
      let x = start.x + translateX;
      let y = start.y + translateY;
      let w = width;
      let h = height;

      if (this.grid.shouldGridlock(inputEvent)) {
        const right = start.x + start.w;
        const bottom = start.y + start.h;
        const snapped = this.grid.getResizeSnappedClientCoordinates(clientX, clientY);

        if (direction[0] > 0) w = snapped.x - start.x;
        else if (direction[0] < 0) {
          x = snapped.x;
          w = right - x;
        }
        if (direction[1] > 0) h = snapped.y - start.y;
        else if (direction[1] < 0) {
          y = snapped.y;
          h = bottom - y;
        }
      }

      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: Math.round(x),
          y: Math.round(y),
          w: Math.max(1, Math.round(w)),
          h: Math.max(1, Math.round(h)),
        }),
      );
    });

    this.moveable.on("scaleStart", ({ target }) => {
      const token = this.getSelectedById(target.id);
      if (token) this.moveableStart = { ...token };
    });

    this.moveable.on("scale", ({ target, scale, drag, inputEvent }) => {
      const token = this.getSelectedById(target.id);
      const start = this.moveableStart;
      if (!token || !start) return;

      const [translateX, translateY] = drag.beforeTranslate;
      const [scaleX, scaleY] = scale;
      const position = this.snapPosition(start.x + translateX, start.y + translateY, inputEvent);

      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: Math.round(position.x),
          y: Math.round(position.y),
          w: Math.max(1, Math.round(start.w * scaleX)),
          h: Math.max(1, Math.round(start.h * scaleY)),
        }),
      );
    });

    this.moveable.on("rotateStart", ({ target }) => {
      const token = this.getSelectedById(target.id);
      if (token) this.moveableStart = { ...token };
    });

    this.moveable.on("rotate", ({ target, beforeRotate, inputEvent }) => {
      const token = this.getSelectedById(target.id);
      const start = this.moveableStart;
      if (!token || !start) return;

      const rotation = start.r + beforeRotate;
      const r = this.grid.shouldGridlock(inputEvent) ? Math.round(rotation / 15) * 15 : Math.round(rotation);

      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: token.x,
          y: token.y,
          w: token.w,
          h: token.h,
          r,
        }),
      );
    });

    this.moveable.on("render", ({ target }) => {
      // The token is redrawn from state; do not stack Moveable's CSS transform on it.
      target.style.transform = "";
    });

    this.moveable.on("renderEnd", () => {
      const token = this.selected[0];
      if (token) {
        this.emit("token_transform", this.toTransform(token));
      }
      this.moveableStart = null;
    });
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;
    element.onmousedown = () => this.emit("tokens_select", [token]);
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    if (this.selected.length !== 0) {
      this.moveable.target = document.getElementById(tokens[0].id) as MoveableRefType;
      this.moveable.updateRect();
    } else {
      this.moveable.target = null;
    }
  }

  private snapPosition(x: number, y: number, inputEvent: MouseEvent) {
    if (!this.grid.shouldGridlock(inputEvent)) return { x, y };
    return this.grid.getSnappedCoordinates(x, y);
  }

  private toTransform(token: Token, overrides: Partial<Transform> = {}): Transform {
    return {
      id: token.id,
      name: token.name,
      x: token.x,
      y: token.y,
      w: token.w,
      h: token.h,
      r: token.r,
      ...overrides,
    };
  }
}

export default TransformView;
