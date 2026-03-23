import { TokenListenerContainer } from "../listeners";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type Viewport from "../models/viewport";
import { util } from "../util";

class TransformView extends TokenListenerContainer {
  private grid: Grid;
  private viewport: Viewport;

  private container: HTMLDivElement;
  private background: SVGSVGElement;

  constructor(grid: Grid, viewport: Viewport) {
    super();

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
  }

  private drag(event: MouseEvent, token: Token) {
    const cursor = this.viewport.getTranslatedCoords(event.offsetX, event.offsetY);

    let x = cursor.x;
    let y = cursor.y;
    const w = token.w;
    const h = token.h;

    if (event.shiftKey) {
      const locked = this.grid.getLockedCoordinates(cursor.x, cursor.y);
      x = locked.x;
      y = locked.y;
    }

    x -= w / 2;
    y -= h / 2;

    if (!util.mouseOnElement(event, this.container)) return;

    this.emit("token_transform", { id: token.id, x, y, w, h });
  }
}

export default TransformView;
