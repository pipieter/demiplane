import { TokenListener } from "../listeners";
import type Grid from "../models/grid";
import { moveable } from "../models/moveable";
import type { Token } from "../models/token";
import type { Point } from "../models/transform";
import { util } from "../util";

class TransformView extends TokenListener {
  private grid: Grid;
  public readonly container: HTMLDivElement;
  public readonly objectsLayer: SVGElement;
  private dragOffset: Point | null = null;
  private selected: Token[];

  constructor(grid: Grid) {
    super();

    this.grid = grid;
    this.container = document.getElementById("whiteboard-container") as HTMLDivElement;
    this.objectsLayer = document.getElementById("whiteboard-objects-layer") as unknown as SVGElement;
    this.selected = [];

    this.initMoveableListeners();
  }

  private initMoveableListeners() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveable.on("drag", ({ target, transform, left, top, right, bottom, delta, dist, clientX, clientY }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        x: left,
        y: top,
      });
      moveable.updateRect();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveable.on("resize", ({ target, width, height, drag }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        x: drag.beforeTranslate[0],
        y: drag.beforeTranslate[1],
        w: width,
        h: height,
      });
      moveable.updateRect();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveable.on("rotate", ({ target, beforeRotate }) => {
      if (this.selected.length === 0) return;
      const token = this.selected[0];

      this.emit("token_continuous_transform", {
        ...token,
        r: beforeRotate, // Moveable handles the Atan2 math for you
      });
      moveable.updateRect();
    });

    moveable.on("renderEnd", () => {
      const token = this.selected[0];
      if (token) {
        this.emit("token_transform", { ...token });
      }
      moveable.updateRect();
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
    moveable.target = document.getElementById(tokens[0].id);
    moveable.updateRect();
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
    this.dragOffset = null;
  }
}

export default TransformView;
