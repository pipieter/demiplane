import type { TokenCircle, TokenRectangle } from "../models/token";
import type State from "../state";
import type Store from "../store";
import { util } from "../util";
import type TokenDrawView from "../views/tokendraw";
import Controller from "./controller";

class TokenDrawController extends Controller<TokenDrawView> {
  constructor(store: Store, state: State, view: TokenDrawView) {
    super(store, state, view);

    this.view.listen("circle_create", ({ x, y, w, h, border, color }) => this.createCircle(border, color, x, y, w, h));
    this.view.listen("rectangle_create", ({ x, y, w, h, border, color }) =>
      this.createRectangle(border, color, x, y, w, h),
    );
    this.view.listen("freedraw_create", ({ base64, x, y, w, h }) => this.createFreedraw(base64, x, y, w, h));
  }

  private createCircle(border: number | null, color: string, x: number, y: number, w: number, h: number) {
    const circle: TokenCircle = {
      type: "circle",
      id: crypto.randomUUID(),
      border,
      color,
      x,
      y,
      w,
      h,
      r: 0,
    };

    this.state.createToken(circle);
    this.store.send({ type: "request_create", create: circle });
  }

  private createRectangle(border: number | null, color: string, x: number, y: number, w: number, h: number) {
    const rectangle: TokenRectangle = {
      type: "rectangle",
      id: crypto.randomUUID(),
      border,
      color,
      x,
      y,
      w,
      h,
      r: 0,
    };

    this.state.createToken(rectangle);
    this.store.send({ type: "request_create", create: rectangle });
  }

  private async createFreedraw(base64: string, x: number, y: number, w: number, h: number) {
    // Create the token locally
    const { href: localHref } = await util.createLocalImage(base64);
    this.state.createToken({
      type: "image",
      id: crypto.randomUUID(),
      href: localHref,
      x,
      y,
      w,
      h,
      r: 0,
    });

    // Upload the token to the server
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
        r: 0,
      },
    });
  }
}

export default TokenDrawController;
