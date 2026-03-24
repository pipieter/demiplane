import { Listener, ListenerContainer } from "../listener";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Point, Transform } from "../models/transform";
import type Viewport from "../models/viewport";
import { util } from "../util";

interface TransformViewMap {
  tokens_select: Token[];
  token_transform: Transform;
}

class TransformViewListeners extends Listener<TransformViewMap> {
  protected override keys(): (keyof TransformViewMap)[] {
    return ["tokens_select", "token_transform"];
  }
}

class TransformView extends ListenerContainer<TransformViewListeners, TransformViewMap> {
  private grid: Grid;
  private viewport: Viewport;

  private container: HTMLDivElement;
  private background: SVGSVGElement;
  private dragOffset: Point | null = null;

  constructor(grid: Grid, viewport: Viewport) {
    super(new TransformViewListeners());

    this.grid = grid;
    this.viewport = viewport;

    this.container = document.getElementById("whiteboard-container") as HTMLDivElement;
    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;

    this.background.onclick = () => this.drop();
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;

    element.onmousedown = (evt) => this.select(evt, token);
  }

  private select(event: MouseEvent, token: Token) {
    event.preventDefault();

    this.emit("tokens_select", [token]);

    document.onmousemove = (evt) => this.drag(evt, token);
    document.onmouseup = () => this.drop();
  }

  private drop() {
    document.onmousemove = null;
    document.onmouseup = null;
    this.dragOffset = null;
  }

  private drag(event: MouseEvent, token: Token) {
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

      x = locked.x - this.dragOffset.x;
      y = locked.y - this.dragOffset.y;
    }

    if (!util.mouseOnElement(event, this.container)) return;

    this.emit("token_transform", { id: token.id, x, y, w, h, r: token.r });
  }
}

export default TransformView;
