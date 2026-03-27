import { Listener, ListenerContainer } from "../listener";

interface GridViewMap {
  grid_change: { size: number; offsetX: number; offsetY: number };
  default_grid_locked: boolean;
}

class GridViewListeners extends Listener<GridViewMap> {
  protected override keys(): (keyof GridViewMap)[] {
    return ["grid_change", "default_grid_locked"];
  }
}

class GridView extends ListenerContainer<GridViewListeners, GridViewMap> {
  private defaultLockedInput: HTMLInputElement;
  private sizeInput: HTMLInputElement;
  private offsetXInput: HTMLInputElement;
  private offsetYInput: HTMLInputElement;
  private pattern: SVGPatternElement;
  private path: SVGPathElement;

  constructor() {
    super(new GridViewListeners());

    this.defaultLockedInput = document.getElementById("grid-global-checkbox") as HTMLInputElement;
    this.sizeInput = document.getElementById("grid-size") as HTMLInputElement;
    this.offsetXInput = document.getElementById("grid-offset-X") as HTMLInputElement;
    this.offsetYInput = document.getElementById("grid-offset-Y") as HTMLInputElement;
    this.pattern = document.getElementById("grid-pattern") as unknown as SVGPatternElement;
    this.path = this.pattern.querySelector("path") as SVGPathElement;

    this.sizeInput.onchange = () => this.onchange();
    this.offsetXInput.onchange = () => this.onchange();
    this.offsetYInput.onchange = () => this.onchange();

    this.defaultLockedInput.addEventListener("change", () => this.onDefaultLockedChange());
    this.onDefaultLockedChange();
  }

  private onDefaultLockedChange() {
    const locked = this.defaultLockedInput.checked;
    this.emit("default_grid_locked", locked);
  }

  private onchange() {
    const size = parseInt(this.sizeInput.value);
    const offsetX = parseInt(this.offsetXInput.value);
    const offsetY = parseInt(this.offsetYInput.value);
    this.emit("grid_change", { size, offsetX, offsetY });
  }

  public set(size: number, offsetX: number, offsetY: number) {
    this.sizeInput.value = size.toString();

    this.offsetXInput.value = offsetX.toString();
    this.offsetXInput.min = (-size / 2).toString();
    this.offsetXInput.max = (size / 2).toString();

    this.offsetYInput.value = offsetY.toString();
    this.offsetYInput.min = (-size / 2).toString();
    this.offsetYInput.max = (size / 2).toString();

    this.pattern.setAttribute("width", `${size}px`);
    this.pattern.setAttribute("height", `${size}px`);
    this.pattern.setAttribute("patternTransform", `translate(${offsetX}, ${offsetY})`);
    this.path.setAttribute("d", `M ${size} 0 L 0 0 0 ${size}`);
  }
}

export default GridView;
