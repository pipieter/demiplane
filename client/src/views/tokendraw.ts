import Listeners from "../listener";
import { grid } from "../whiteboard/grid";
import { viewport } from "../whiteboard/viewport";

interface TokenDrawViewMap {
  circle_create: { x: number; y: number; w: number; h: number };
  rectangle_create: { x: number; y: number; w: number; h: number };
  free_draw_create: { base64: string; x: number; y: number; w: number; h: number };
}

class TokenDrawViewListeners extends Listeners<TokenDrawViewMap> {
  protected override keys(): (keyof TokenDrawViewMap)[] {
    return ["circle_create", "rectangle_create", "free_draw_create"];
  }
}

type TokenDrawType = "circle";

class TokenDrawView {
  private readonly layer: SVGSVGElement;
  private readonly circle: SVGCircleElement;
  private readonly cursor: SVGCircleElement;

  private readonly circleButton: HTMLButtonElement;

  private type: TokenDrawType | null;
  private mouseDown: boolean;
  private readonly start: { x: number; y: number };
  private readonly current: { x: number; y: number };

  private listeners: TokenDrawViewListeners;

  constructor() {
    this.layer = document.getElementById("whiteboard-drawing-layer") as unknown as SVGSVGElement;
    this.circle = document.getElementById("whiteboard-drawing-circle") as unknown as SVGCircleElement;
    this.cursor = document.getElementById("whiteboard-drawing-cursor") as unknown as SVGCircleElement;

    this.circleButton = document.getElementById("begin-circle-button") as HTMLButtonElement;

    this.type = null;
    this.mouseDown = false;
    this.start = { x: 0, y: 0 };
    this.current = { x: 0, y: 0 };

    this.listeners = new TokenDrawViewListeners();

    this.circleButton.addEventListener("click", () => this.begin("circle"));
  }

  private begin(type: TokenDrawType) {
    viewport.disable();
    this.mouseDown = false;
    this.cursor.style.display = "";
    this.layer.style.display = "";
    this.layer.style.pointerEvents = "";
    this.type = type;

    document.onkeydown = (evt) => this.onkeydown(evt);
    this.layer.onmouseup = () => this.onmouseup();
    this.layer.onmousedown = (evt) => this.onmousedown(evt);
    this.layer.onmousemove = (evt) => this.onmousemove(evt);

    switch (type) {
      case "circle":
        this.circle.setAttribute("cx", "0");
        this.circle.setAttribute("cy", "0");
        this.circle.setAttribute("rx", "0");
        this.circle.setAttribute("ry", "0");
        break;
    }
  }

  private onmousedown(evt: MouseEvent) {
    // Cancel on right click
    if (evt.buttons & 2) {
      this.cancel();
      return;
    }

    // Begin drawing on left click
    if (evt.buttons & 1) {
      const { x, y } = this.getCoordinates(evt);

      this.mouseDown = true;
      this.start.x = x;
      this.start.y = y;
      this.current.x = x;
      this.current.y = y;

      switch (this.type) {
        case "circle":
          this.circle.style.display = "";
          break;
      }
      return;
    }
  }

  private onmousemove(evt: MouseEvent) {
    let { x, y } = this.getCoordinates(evt);
    this.updateCursor(x, y);

    if (!this.mouseDown) return;

    this.current.x = x;
    this.current.y = y;

    switch (this.type) {
      case "circle":
        const cx = (this.start.x + this.current.x) / 2;
        const cy = (this.start.y + this.current.y) / 2;
        const rx = Math.abs((this.start.x - this.current.x) / 2);
        const ry = Math.abs((this.start.y - this.current.y) / 2);
        this.circle.setAttribute("cx", cx.toString());
        this.circle.setAttribute("cy", cy.toString());
        this.circle.setAttribute("rx", rx.toString());
        this.circle.setAttribute("ry", ry.toString());
        break;
    }
  }

  private onmouseup() {
    switch (this.type) {
      case "circle":
        const x = Math.min(this.start.x, this.current.x);
        const y = Math.min(this.start.y, this.current.y);
        const w = Math.abs(this.start.x - this.current.x);
        const h = Math.abs(this.start.y - this.current.y);
        this.listeners.emit("circle_create", { x, y, w, h });
        break;
    }

    this.cancel();
  }

  private onkeydown(evt: KeyboardEvent) {
    if (evt.key === "Escape") this.cancel();
  }

  private updateCursor(x: number, y: number) {
    this.cursor.setAttribute("cx", x.toString());
    this.cursor.setAttribute("cy", y.toString());
  }

  private getCoordinates(evt: MouseEvent) {
    let { x, y } = viewport.getZoomTranslatedCoords(evt.offsetX, evt.offsetY);
    if (evt.shiftKey) {
      const gridLocked = grid.getGridlockedCoords(x, y);
      x = gridLocked.x;
      y = gridLocked.y;
    }
    return { x, y };
  }

  private cancel() {
    this.mouseDown = false;
    this.cursor.style.display = "none";
    this.circle.style.display = "none";
    this.layer.style.display = "none";
    this.layer.onmousedown = null;
    this.layer.onmouseup = null;
    this.layer.onmousemove = null;
    document.onkeydown = null;
    viewport.enable();
  }

  public listen<K extends keyof TokenDrawViewMap>(type: K, listener: (value: TokenDrawViewMap[K]) => void) {
    this.listeners.listen(type, listener);
  }
}

export default TokenDrawView;
