import Listeners from "../listener";

interface GridViewMap {
  grid_change: { size: number; offsetX: number; offsetY: number };
}

class GridViewListeners extends Listeners<GridViewMap> {
  protected override keys(): (keyof GridViewMap)[] {
    return ["grid_change"];
  }
}

class GridView {
  private sizeInput: HTMLInputElement;
  private offsetXInput: HTMLInputElement;
  private offsetYInput: HTMLInputElement;
  private pattern: SVGPatternElement;
  private path: SVGPathElement;

  private listeners: GridViewListeners;

  constructor() {
    this.sizeInput = document.getElementById("grid-size") as HTMLInputElement;
    this.offsetXInput = document.getElementById("grid-offset-X") as HTMLInputElement;
    this.offsetYInput = document.getElementById("grid-offset-Y") as HTMLInputElement;
    this.pattern = document.getElementById("grid-pattern") as unknown as SVGPatternElement;
    this.path = this.pattern.querySelector("path") as SVGPathElement;

    this.listeners = new GridViewListeners();

    this.sizeInput.onchange = () => this.onchange();
    this.offsetXInput.onchange = () => this.onchange();
    this.offsetYInput.onchange = () => this.onchange();
  }

  private onchange() {
    const size = parseInt(this.sizeInput.value);
    const offsetX = parseInt(this.offsetXInput.value);
    const offsetY = parseInt(this.offsetYInput.value);
    this.listeners.emit("grid_change", { size, offsetX, offsetY });
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

  public listen<K extends keyof GridViewMap>(type: K, listener: (value: GridViewMap[K]) => void) {
    this.listeners.listen(type, listener);
  }
}

export default GridView;
