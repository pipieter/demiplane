import type State from "../state";
import type Store from "../store";
import type TokenDrawView from "../views/tokendraw";

class TokenDrawController {
  private store: Store;
  private state: State;
  private view: TokenDrawView;

  constructor(store: Store, state: State, view: TokenDrawView) {
    this.store = store;
    this.state = state;
    this.view = view;

    this.view.listen("circle_create", ({ x, y, w, h }) => this.createCircle(x, y, w, h));
  }

  private createCircle(x: number, y: number, w: number, h: number) {
    const color = "#FF0000"; //TODO

    this.store.send({
      type: "request_create",
      create: {
        type: "circle",
        id: crypto.randomUUID(),
        color,
        x,
        y,
        w,
        h,
      },
    });
  }
}

export default TokenDrawController;
