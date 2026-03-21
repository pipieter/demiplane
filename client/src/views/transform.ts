import { Listener, ListenerContainer } from "../listener";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import { util } from "../util";
import { viewport } from "../whiteboard/viewport";

interface TransformViewMap {
  tokens_select: string[];
  token_transform: Transform;
}

class TransformViewListeners extends Listener<TransformViewMap> {
  protected override keys(): (keyof TransformViewMap)[] {
    return ["tokens_select", "token_transform"];
  }
}

class TransformView extends ListenerContainer<TransformViewListeners, TransformViewMap> {
  private grid: Grid;

  private container: HTMLDivElement;
  private background: SVGSVGElement;

  constructor(grid: Grid) {
    super(new TransformViewListeners());
    this.grid = grid;

    this.container = document.getElementById("whiteboard-container") as HTMLDivElement;
    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;

    this.background.onclick = () => this.drop();
  }

  public makeDraggable(token: Token) {
    const element = document.getElementById(token.id) as unknown as SVGElement;

    element.onmousedown = (evt) => this.select(evt, token.id);
  }

  private select(event: MouseEvent, id: string) {
    event.preventDefault();

    this.emit("tokens_select", [id]);

    document.onmousemove = (evt) => this.drag(evt, id);
    document.onmouseup = () => this.drop();
  }

  private drop() {
    document.onmousemove = null;
    document.onmouseup = null;
  }

  private drag(event: MouseEvent, id: string) {
    const element = document.getElementById(id) as unknown as SVGGraphicsElement;
    const cursor = viewport.getZoomTranslatedCoords(event.offsetX, event.offsetY);

    const bbox = element.getBBox();
    const w = bbox.width;
    const h = bbox.height;

    let x = cursor.x;
    let y = cursor.y;

    if (event.shiftKey) {
      const locked = this.grid.getLockedCoordinates(cursor.x, cursor.y);
      x = locked.x;
      y = locked.y;
    }

    x -= bbox.width / 2;
    y -= bbox.height / 2;

    if (!util.mouseOnElement(event, this.container)) return;

    this.emit("token_transform", { id, x, y, w, h });
  }
}

export default TransformView;
