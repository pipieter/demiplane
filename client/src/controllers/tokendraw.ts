import type { TokenCircle, TokenLine, TokenRectangle } from "../models/token";
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
    this.view.listen("line_create", ({ x1, y1, x2, y2, width, color }) =>
      this.createLine(x1, y1, x2, y2, width, color),
    );
    this.view.listen("image_create", ({ base64, x, y, w, h }) => this.createFreedraw(base64, x, y, w, h));
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

  private createLine(x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
    const line: TokenLine = {
      type: "line",
      id: crypto.randomUUID(),
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      width,
      color,
      r: 0,
    };

    this.state.createToken(line);
    this.store.send({ type: "request_create", create: line });
  }

  private async createFreedraw(base64: string, x: number, y: number, w: number, h: number) {
    const id = crypto.randomUUID();

    // Create the token locally
    const { href: localHref } = await util.createLocalImage(base64);
    this.state.createToken({
      type: "image",
      id,
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
        id,
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
