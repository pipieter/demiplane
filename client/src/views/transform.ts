import { TokenListener } from "../listeners";
import type Grid from "../models/grid";
import { getMoveable } from "../models/moveable";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type { MoveableRefType } from "moveable/declaration/types";

class TransformView extends TokenListener {
  private readonly moveable = getMoveable();
  private readonly grid: Grid;
  private readonly text: SVGTextElement;
  private readonly textRectangle: SVGRectElement;
  private selected: Token[];
  private moveableStart: Transform | null = null;

  constructor(grid: Grid) {
    super();

    this.grid = grid;
    this.text = document.getElementById("transform-size-text") as unknown as SVGTextElement;
    this.textRectangle = document.getElementById("transform-size-background") as unknown as SVGRectElement;
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

    this.moveable.on("resize", ({ target, width, height, direction, clientX, clientY, inputEvent }) => {
      const token = this.getSelectedById(target.id);
      const start = this.moveableStart;
      if (!token || !start) return;

      let w = width;
      let h = height;

      if (this.grid.shouldGridlock(inputEvent)) {
        const snapped = this.grid.getResizeSnappedClientCoordinates(clientX, clientY);
        const localCursor = this.rotatePoint(
          snapped.x,
          snapped.y,
          start.x + start.w / 2,
          start.y + start.h / 2,
          -start.r,
        );

        if (direction[0] > 0) w = localCursor.x - start.x;
        else if (direction[0] < 0) w = start.x + start.w - localCursor.x;
        if (direction[1] > 0) h = localCursor.y - start.y;
        else if (direction[1] < 0) h = start.y + start.h - localCursor.y;
      }

      const position = this.getResizedPosition(start, w, h, direction);

      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: Math.round(position.x),
          y: Math.round(position.y),
          w: Math.max(1, Math.round(position.w)),
          h: Math.max(1, Math.round(position.h)),
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
    element.onmousedown = (event) => {
      this.selected = [token];
      if (this.update(this.selected)) {
        this.moveable.dragStart(event, element);
        this.emit("tokens_select", [token]);
      }
    };
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    this.update(this.selected);
  }

  private snapPosition(x: number, y: number, inputEvent: MouseEvent) {
    if (!this.grid.shouldGridlock(inputEvent)) return { x, y };
    return this.grid.getSnappedCoordinates(x, y);
  }

  private rotatePoint(px: number, py: number, cx: number, cy: number, angle: number) {
    const radians = (angle * Math.PI) / 180;
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + dx * Math.cos(radians) - dy * Math.sin(radians),
      y: cy + dx * Math.sin(radians) + dy * Math.cos(radians),
    };
  }

  private getResizedPosition(start: Transform, width: number, height: number, direction: number[]) {
    const startCenter = {
      x: start.x + start.w / 2,
      y: start.y + start.h / 2,
    };
    const fixedLocal = {
      x: direction[0] < 0 ? start.x + start.w : start.x,
      y: direction[1] < 0 ? start.y + start.h : start.y,
    };
    const fixedWorld = this.rotatePoint(fixedLocal.x, fixedLocal.y, startCenter.x, startCenter.y, start.r);
    const nextFixedLocal = {
      x: direction[0] < 0 ? width : 0,
      y: direction[1] < 0 ? height : 0,
    };
    const rotatedOffset = this.rotatePoint(nextFixedLocal.x, nextFixedLocal.y, width / 2, height / 2, start.r);
    const nextCenter = {
      x: fixedWorld.x - (rotatedOffset.x - width / 2),
      y: fixedWorld.y - (rotatedOffset.y - height / 2),
    };

    return {
      x: nextCenter.x - width / 2,
      y: nextCenter.y - height / 2,
      w: width,
      h: height,
    };
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

  private update(tokens: Token[]): boolean {
    // Only handle one token for now
    const token = tokens[0];
    if (!token) {
      this.moveable.target = null;
      this.text.style.display = "none";
      this.textRectangle.style.display = "none";
      return false;
    }

    const nonRotatableTokenTypes = ["line"];
    const target = document.getElementById(tokens[0].id) as unknown as SVGElement;
    this.moveable.target = target;
    this.moveable.rotatable = !nonRotatableTokenTypes.includes(token.type);

    this.moveable.updateRect();
    this.updateTransformSizeText(token);

    return true;
  }

  private updateTransformSizeText(token: Token) {
    if (!this.moveable.target) {
      return;
    }

    // Update the small text under the moveable grid
    this.text.style.display = "";
    this.textRectangle.style.display = "";

    const width = (token.w / this.grid.size).toFixed(1).replace(".0", "");
    const height = (token.h / this.grid.size).toFixed(1).replace(".0", "");
    this.text.textContent = `${width} x ${height}`;

    const textWidth = this.text.getBBox().width;
    const textHeight = this.text.getBBox().height;
    const rectWidth = textWidth + 16;
    const rectHeight = textHeight + 4;

    const px = token.x + token.w - rectWidth;
    const py = token.y + token.h + 1; // Small bump so it's fully below the transform rectangle

    const cx = token.x + token.w / 2;
    const cy = token.y + token.h / 2;
    const angle = token.r;

    // Manually style the text and its background
    this.textRectangle.setAttribute("x", px.toString());
    this.textRectangle.setAttribute("y", py.toString());
    this.textRectangle.setAttribute("width", rectWidth.toString());
    this.textRectangle.setAttribute("height", rectHeight.toString());
    this.textRectangle.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);

    this.text.setAttribute("x", (px + 8).toString());
    this.text.setAttribute("y", (py + 20).toString());
    this.text.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
  }
}

export default TransformView;
