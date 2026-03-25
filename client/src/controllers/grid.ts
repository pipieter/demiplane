import type State from "../state";
import type Store from "../store";
import type GridView from "../views/grid";
import Controller from "./controller";

class GridController extends Controller<GridView> {
  constructor(store: Store, state: State, view: GridView) {
    super(store, state, view);

    this.view.listen("grid_change", ({ size, offsetX, offsetY }) => this.onchange(size, offsetX, offsetY));
    this.state.listen("grid_change", (grid) => this.view.set(grid.size, grid.offset.x, grid.offset.y));
  }

  private onchange(size: number, offsetX: number, offsetY: number) {
    const grid = { size, offset: { x: offsetX, y: offsetY } };

    this.state.setGrid(grid);
    this.store.send({
      type: "request_grid",
      grid,
    });
  }
}

export default GridController;
