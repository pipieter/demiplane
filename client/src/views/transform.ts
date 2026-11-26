import { TokenListener } from "../listeners";
import type Grid from "../models/grid";
import { getMoveable } from "../models/moveable";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";

class TransformView extends TokenListener {
  private readonly moveable = getMoveable();
  private readonly grid: Grid;
  private readonly text: SVGTextElement;
  private readonly textRectangle: SVGRectElement;
  private readonly proxy: SVGRectElement;
  private selected: Token[];
  private moveableStart: Map<string, Transform> | null = null;
  private moveableStartBounds: { x: number; y: number; w: number; h: number } | null = null;
  private updatingSelectionFromPointer = false;

  constructor(grid: Grid) {
    super();

    this.grid = grid;
    this.text = document.getElementById("transform-size-text") as unknown as SVGTextElement;
    this.textRectangle = document.getElementById("transform-size-background") as unknown as SVGRectElement;
    this.proxy = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.proxy.id = "moveable-selection-proxy";
    this.proxy.classList.add("moveable-selection-proxy");
    this.proxy.setAttribute("fill", "none");
    this.proxy.setAttribute("stroke", "none");
    this.proxy.style.pointerEvents = "none";
    this.proxy.style.opacity = "0";
    document.getElementById("whiteboard-objects-layer")?.appendChild(this.proxy);
    this.selected = [];

    this.initMoveableListeners();
  }

  private getSelectedById(id: string): Token | null {
    return this.selected.find((token) => token.id === id) ?? null;
  }

  private getStartById(id: string): Transform | null {
    return this.moveableStart?.get(id) ?? null;
  }

  private startTransform() {
    this.moveableStart = new Map(this.selected.map((token) => [token.id, { ...token }]));
    this.moveableStartBounds = this.getGroupBounds([...this.moveableStart.values()]);
  }

  private finishTransform() {
    if (!this.moveableStart) return;

    for (const token of this.selected) {
      this.emit("token_transform", this.toTransform(token));
    }

    this.moveableStart = null;
    this.moveableStartBounds = null;
    this.update(this.selected);
  }

  private getGroupBounds(tokens: Array<Pick<Transform, "x" | "y" | "w" | "h" | "r">>) {
    const points = tokens.flatMap((token) => {
      const centerX = token.x + token.w / 2;
      const centerY = token.y + token.h / 2;
      return [
        this.rotatePoint(token.x, token.y, centerX, centerY, token.r),
        this.rotatePoint(token.x + token.w, token.y, centerX, centerY, token.r),
        this.rotatePoint(token.x, token.y + token.h, centerX, centerY, token.r),
        this.rotatePoint(token.x + token.w, token.y + token.h, centerX, centerY, token.r),
      ];
    });

    const left = Math.min(...points.map((point) => point.x));
    const top = Math.min(...points.map((point) => point.y));
    const right = Math.max(...points.map((point) => point.x));
    const bottom = Math.max(...points.map((point) => point.y));

    return {
      x: left,
      y: top,
      w: Math.max(1, right - left),
      h: Math.max(1, bottom - top),
      r: 0,
    };
  }

  private setProxyBounds(bounds: { x: number; y: number; w: number; h: number }) {
    this.proxy.setAttribute("x", bounds.x.toString());
    this.proxy.setAttribute("y", bounds.y.toString());
    this.proxy.setAttribute("width", bounds.w.toString());
    this.proxy.setAttribute("height", bounds.h.toString());
  }

  private transformGroup(scaleX: number, scaleY: number, x: number, y: number, inputEvent: MouseEvent) {
    const bounds = this.moveableStartBounds;
    if (!bounds) return;

    const snappedPosition = this.snapPosition(x, y, inputEvent);
    const offsetX = snappedPosition.x - x;
    const offsetY = snappedPosition.y - y;

    for (const token of this.selected) {
      const start = this.getStartById(token.id);
      if (!start) continue;

      const width = Math.max(1, Math.round(start.w * scaleX));
      const height = Math.max(1, Math.round(start.h * scaleY));
      const centerX = x + offsetX + (start.x + start.w / 2 - bounds.x) * scaleX;
      const centerY = y + offsetY + (start.y + start.h / 2 - bounds.y) * scaleY;
      this.emit(
        "token_continuous_transform",
        this.toTransform(token, {
          x: Math.round(centerX - width / 2),
          y: Math.round(centerY - height / 2),
          w: width,
          h: height,
        }),
      );
    }

    const updatedBounds = this.getGroupBounds(this.selected);
    this.setProxyBounds(updatedBounds);
    this.moveable.updateRect();
    this.updateTransformSizeText(updatedBounds);
  }

  private transformGroupResize(
    width: number,
    height: number,
    direction: number[],
    translateX: number,
    translateY: number,
    clientX: number,
    clientY: number,
    inputEvent: MouseEvent,
  ) {
    const bounds = this.moveableStartBounds;
    if (!bounds) return;

    let scaleX = width / bounds.w;
    let scaleY = height / bounds.h;
    let x = bounds.x + translateX;
    let y = bounds.y + translateY;

    if (this.grid.shouldGridlock(inputEvent)) {
      const snapped = this.grid.getResizeSnappedClientCoordinates(clientX, clientY);
      if (direction[0] > 0) scaleX = (snapped.x - bounds.x) / bounds.w;
      else if (direction[0] < 0) scaleX = (bounds.x + bounds.w - snapped.x) / bounds.w;
      if (direction[1] > 0) scaleY = (snapped.y - bounds.y) / bounds.h;
      else if (direction[1] < 0) scaleY = (bounds.y + bounds.h - snapped.y) / bounds.h;
      x = direction[0] < 0 ? bounds.x + bounds.w - bounds.w * scaleX : bounds.x;
      y = direction[1] < 0 ? bounds.y + bounds.h - bounds.h * scaleY : bounds.y;
    }

    const scale =
      direction[0] === 0
        ? scaleY
        : direction[1] === 0
          ? scaleX
          : Math.abs(scaleX - 1) >= Math.abs(scaleY - 1)
            ? scaleX
            : scaleY;
    this.transformGroup(scale, scale, x, y, inputEvent);
  }

  private initMoveableListeners() {
    this.moveable.on("dragStart", () => this.startTransform());

    this.moveable.on("drag", ({ target, beforeTranslate, inputEvent }) => {
      if (target === this.proxy) {
        const bounds = this.moveableStartBounds;
        if (!bounds) return;
        this.transformGroup(1, 1, bounds.x + beforeTranslate[0], bounds.y + beforeTranslate[1], inputEvent);
        return;
      }

      const token = this.getSelectedById(target.id);
      const start = this.getStartById(target.id);
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
      this.updateTransformSizeText(token);
    });

    this.moveable.on("resizeStart", () => this.startTransform());

    this.moveable.on("resize", ({ target, width, height, direction, clientX, clientY, drag, inputEvent }) => {
      if (target === this.proxy) {
        this.transformGroupResize(
          width,
          height,
          direction,
          drag.beforeTranslate[0],
          drag.beforeTranslate[1],
          clientX,
          clientY,
          inputEvent,
        );
        return;
      }

      const token = this.getSelectedById(target.id);
      const start = this.getStartById(target.id);
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
      this.updateTransformSizeText(token);
    });

    this.moveable.on("scaleStart", () => this.startTransform());

    this.moveable.on("scale", ({ target, scale, drag, inputEvent }) => {
      if (target === this.proxy) {
        const bounds = this.moveableStartBounds;
        if (!bounds) return;
        const scaleFactor = Math.abs(scale[0] - 1) >= Math.abs(scale[1] - 1) ? scale[0] : scale[1];
        this.transformGroup(
          scaleFactor,
          scaleFactor,
          bounds.x + drag.beforeTranslate[0],
          bounds.y + drag.beforeTranslate[1],
          inputEvent,
        );
        return;
      }

      const token = this.getSelectedById(target.id);
      const start = this.getStartById(target.id);
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
      this.updateTransformSizeText(token);
    });

    this.moveable.on("rotateStart", () => this.startTransform());

    this.moveable.on("rotate", ({ target, beforeRotate, inputEvent }) => {
      if (target === this.proxy) return;

      const token = this.getSelectedById(target.id);
      const start = this.getStartById(target.id);
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
      this.updateTransformSizeText(token);
    });

    this.moveable.on("render", ({ target }) => {
      // The token is redrawn from state; do not stack Moveable's CSS transform on it.
      target.style.transform = "";
    });

    this.moveable.on("dragEnd", () => this.finishTransform());
    this.moveable.on("resizeEnd", () => this.finishTransform());
    this.moveable.on("scaleEnd", () => this.finishTransform());
    this.moveable.on("rotateEnd", () => this.finishTransform());
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;
    element.onmousedown = (event) => {
      const isModifierClick = event.ctrlKey || event.metaKey;
      const wasSelected = this.selected.some((selected) => selected.id === token.id);
      const next = isModifierClick
        ? wasSelected
          ? this.selected.filter((selected) => selected.id !== token.id)
          : [...this.selected, token]
        : wasSelected
          ? this.selected
          : [token];

      this.selected = [...next];
      const shouldDrag = !(isModifierClick && wasSelected);
      const targetChange = this.update(this.selected);
      this.updatingSelectionFromPointer = true;
      try {
        this.emit("tokens_select", this.selected);
      } finally {
        this.updatingSelectionFromPointer = false;
      }

      if (shouldDrag && this.selected.length > 0) {
        const dragTarget = this.selected.length > 1 ? this.proxy : element;
        if (targetChange) {
          targetChange.then(() => this.moveable.dragStart(event, dragTarget));
        } else {
          this.moveable.dragStart(event, dragTarget);
        }
      }
    };
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    if (this.updatingSelectionFromPointer || (this.moveableStart && this.selected.length > 1)) return;
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

  private update(tokens: Token[]): Promise<void> | null {
    if (tokens.length === 0) {
      this.moveable.setState({ target: null, keepRatio: false, rotatable: false });
      this.text.style.display = "none";
      this.textRectangle.style.display = "none";
      return null;
    }

    let target: HTMLElement | SVGElement;
    if (tokens.length > 1) {
      const bounds = this.getGroupBounds(tokens);
      this.setProxyBounds(bounds);
      target = this.proxy;
    } else {
      const element = document.getElementById(tokens[0].id);
      if (!element) {
        this.moveable.setState({ target: null, keepRatio: false, rotatable: false });
        this.text.style.display = "none";
        this.textRectangle.style.display = "none";
        return null;
      }
      target = element;
    }

    const currentTargets = this.moveable.getTargets();
    const hasTargetChanged = currentTargets.length !== 1 || currentTargets[0] !== target;
    const size = tokens.length === 1 ? tokens[0] : this.getGroupBounds(tokens);
    if (!hasTargetChanged) {
      this.moveable.updateRect();
      this.updateTransformSizeText(size);
      return null;
    }

    const targetChange = this.moveable.waitToChangeTarget();

    this.moveable.setState(
      { target, keepRatio: tokens.length > 1, rotatable: tokens.length === 1 && tokens[0].type !== "line" },
      () => {
        const updateRect = () => {
          this.moveable.updateRect();
          this.updateTransformSizeText(size);
        };

        if (targetChange) {
          targetChange.then(updateRect);
        } else {
          updateRect();
        }
      },
    );
    return targetChange;
  }

  private updateTransformSizeText(token: Pick<Transform, "x" | "y" | "w" | "h" | "r">) {
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
