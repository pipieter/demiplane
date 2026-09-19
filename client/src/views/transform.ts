import { TokenListener } from "../listeners";
import { getMoveable } from "../models/moveable";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type Grid from "../models/grid";

class TransformView extends TokenListener {
  private readonly moveable = getMoveable();
  private readonly grid: Grid;
  private selected: Token[];
  private moveableStarts = new Map<string, Transform>();

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
    this.moveable.on("dragGroupStart", ({ events }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        if (token) this.moveableStarts.set(token.id, { ...token });
      });
    });

    this.moveable.on("dragGroup", ({ events, inputEvent }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        const start = token ? this.moveableStarts.get(token.id) : null;
        if (!token || !start) return;

        const [translateX, translateY] = ev.beforeTranslate;
        const position = this.snapPosition(start.x + translateX, start.y + translateY, inputEvent);

        this.emit(
          "token_continuous_transform",
          this.toTransform(token, {
            x: Math.round(position.x),
            y: Math.round(position.y),
          }),
        );
      });
    });

    this.moveable.on("resizeGroupStart", ({ events }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        if (token) this.moveableStarts.set(token.id, { ...token });
      });
    });

    this.moveable.on("resizeGroup", ({ events, clientX, clientY, inputEvent }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        const start = token ? this.moveableStarts.get(token.id) : null;
        if (!token || !start) return;

        let w = ev.width;
        let h = ev.height;
        const direction = ev.direction;

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
    });

    this.moveable.on("scaleGroupStart", ({ events }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        if (token) this.moveableStarts.set(token.id, { ...token });
      });
    });

    this.moveable.on("scaleGroup", ({ events, inputEvent }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        const start = token ? this.moveableStarts.get(token.id) : null;
        if (!token || !start) return;

        const [translateX, translateY] = ev.drag.beforeTranslate;
        const [scaleX, scaleY] = ev.scale;
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
    });

    this.moveable.on("rotateGroupStart", ({ events }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        if (token) this.moveableStarts.set(token.id, { ...token });
      });
    });

    this.moveable.on("rotateGroup", ({ events, inputEvent }) => {
      events.forEach((ev) => {
        const token = this.getSelectedById(ev.target.id);
        const start = token ? this.moveableStarts.get(token.id) : null;
        if (!token || !start) return;

        const rotation = start.r + ev.beforeRotate;
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
    });

    this.moveable.on("renderGroup", ({ events }) => {
      events.forEach((ev) => {
        ev.target.style.transform = "";
      });
    });

    this.moveable.on("renderGroupEnd", () => {
      this.selected.forEach((token) => {
        this.emit("token_transform", this.toTransform(token));
      });
      this.moveableStarts.clear();
    });
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;

    element.onmousedown = (event) => {
      const isModifierPressed = event.shiftKey || event.ctrlKey || event.metaKey;
      const isAlreadySelected = this.selected.some((t) => t.id === token.id);
      let newSelected: Token[];

      if (isModifierPressed) {
        newSelected = isAlreadySelected ? this.selected.filter((t) => t.id !== token.id) : [...this.selected, token];
      } else {
        newSelected = isAlreadySelected ? this.selected : [token];
      }

      this.setSelected(newSelected);

      if (this.selected.length > 0) {
        // Pass the event AND the specific element clicked so Moveable 
        // can look up the correct child matrix in group mode
        this.moveable.dragStart(event, element);
      }

      this.emit("tokens_select", newSelected);
    };
  }

  public setSelected(tokens: Token[]) {
    this.selected = [...tokens];
    if (this.selected.length === 0) {
      this.moveable.target = null;
      return;
    }

    this.moveable.target = this.selected
      .map((token) => document.getElementById(token.id))
      .filter((el): el is HTMLElement => el !== null);
    this.moveable.updateRect();
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
}

export default TransformView;
