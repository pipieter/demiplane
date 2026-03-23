import type State from "../state";
import type Store from "../store";
import type TokenDrawView from "../views/tokendraw";
import Controller from "./controller";

class TokenDrawController extends Controller<TokenDrawView> {
  constructor(store: Store, state: State, view: TokenDrawView) {
    super(store, state, view);

    this.view.listen("circle_create", ({ x, y, w, h, border }) => this.createCircle(border, x, y, w, h));
    this.view.listen("rectangle_create", ({ x, y, w, h, border }) => this.createRectangle(border, x, y, w, h));
    this.view.listen("freedraw_create", ({ base64, x, y, w, h }) => this.createFreedraw(base64, x, y, w, h));
  }

  private createCircle(border: number | null, x: number, y: number, w: number, h: number) {
    const color = "#FF0000"; //TODO

    this.store.send({
      type: "request_create",
      create: {
        type: "circle",
        id: crypto.randomUUID(),
        border,
        color,
        x,
        y,
        w,
        h,
      },
    });
  }

  private createRectangle(border: number | null, x: number, y: number, w: number, h: number) {
    const color = "#00FF00"; //TODO

    this.store.send({
      type: "request_create",
      create: {
        type: "rectangle",
        id: crypto.randomUUID(),
        border,
        color,
        x,
        y,
        w,
        h,
      },
    });
  }

  private async createFreedraw(base64: string, x: number, y: number, w: number, h: number) {
    const href = await this.store.uploadImage(base64);

    this.store.send({
      type: "request_create",
      create: {
        type: "image",
        id: crypto.randomUUID(),
        href,
        x,
        y,
        w,
        h,
      },
    });
  }
}

export default TokenDrawController;
