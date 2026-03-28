import calc from "../calc";
import { TokenListenerContainer } from "../listeners";
import type Grid from "../models/grid";
import type { Token } from "../models/token";
import type { Point } from "../models/transform";
import type State from "../state";

class SelectionView extends TokenListenerContainer {
  private background: SVGSVGElement;
  private selected: Token[];
  private grid: Grid;
  private start: Point | null;
  private selection: SVGSVGElement;
  private selectionBox: SVGRectElement;

  constructor(grid: Grid, state: State /* temporary for debugging */) {
    super();

    this.grid = grid;
    this.start = null;
    this.selected = [];

    this.background = document.getElementById("whiteboard-background-layer") as unknown as SVGSVGElement;
    this.selection = document.getElementById("whiteboard-selection") as unknown as SVGSVGElement;
    this.selectionBox = document.getElementById("selection-box") as unknown as SVGRectElement;

    this.background.onclick = () => this.clear();

    window.addEventListener("keydown", (event) => {
      // Don't trigger this event if focused on another input, e.g. a text input
      if (document.activeElement?.tagName.toLowerCase() === "input") return;

      const keys = ["Delete", "Backspace"];
      if (this.selected && keys.includes(event.key)) {
        this.delete();
      }
    });

    window.addEventListener("mousemove", (evt) => {
      const { x, y } = this.grid.getCoordinates(evt);

      if (evt.ctrlKey) {
        if (this.start === null) {
          this.start = { x, y };
        }
      } else {
        this.start = null;
        this.selection.style.display = "none";
        return;
      }

      const rx = Math.min(x, this.start.x);
      const ry = Math.min(y, this.start.y);
      const rw = Math.abs(x - this.start.x);
      const rh = Math.abs(y - this.start.y);

      this.selectionBox.setAttribute("x", rx.toString());
      this.selectionBox.setAttribute("y", ry.toString());
      this.selectionBox.setAttribute("width", rw.toString());
      this.selectionBox.setAttribute("height", rh.toString());
      this.selection.style.display = "";

      const rect = new DOMRect(rx, ry, rw, rh);
      for (const token of state.getTokens()) {
        const element = document.getElementById(token.id)!;
        if (calc.overlap(rect, token)) {
          element.setAttribute("fill", "red");
        } else {
          element.setAttribute("fill", "black");
        }
      }
    });
  }

  public select(previous: Token[], current: Token[]) {
    for (const token of previous) {
      document.getElementById(token.id)?.classList.remove("selected");
    }

    for (const token of current) {
      document.getElementById(token.id)?.classList.add("selected");
    }

    this.selected = [...current];
  }

  public clear() {
    this.emit("tokens_select", []);
  }

  public delete() {
    this.emit("tokens_delete", [...this.selected]);
  }
}

export default SelectionView;
