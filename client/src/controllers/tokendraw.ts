import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type TokenDrawView from "../views/tokendraw";
import Controller from "./controller";

class TokenDrawController extends Controller<TokenDrawView> {
  constructor(store: Store, state: State, view: TokenDrawView) {
    super(store, state, view);

    this.view.listen("circle_create", ({ x, y, w, h, border, color }) => this.createCircle(border, color, x, y, w, h));
    this.view.listen("rectangle_create", ({ x, y, w, h, border, color }) =>
      this.createRectangle(border, color, x, y, w, h),
    );
    this.view.listen("freedraw_create", ({ base64, x, y, w, h }) => this.createImageFromBase64(base64, x, y, w, h));
    this.view.listen("image_create", ({ base64, x, y, w, h }) => this.createImageFromBase64(base64, x, y, w, h));

    document.addEventListener("copy", async (e) => {
      e.preventDefault();
      await this.copy();
    })

    document.addEventListener("cut", async (e) => {
      e.preventDefault();
      await this.cut();
    })

    document.addEventListener("paste", async (e) => {
      e.preventDefault();
      await this.paste();
    })
  }

  private createCircle(border: number | null, color: string, x: number, y: number, w: number, h: number, r: number = 0) {
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
        r,
      },
    });
  }

  private createRectangle(border: number | null, color: string, x: number, y: number, w: number, h: number, r: number = 0) {
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
        r,
      },
    });
  }

  private async createImageFromBase64(base64: string, x: number, y: number, w: number, h: number, r: number = 0) {
    const href = await this.store.uploadImage(base64);
    if (!href) throw "Could not upload image to server.";
    this.createImage(href, x, y, w, h, r);
  }

  private async createImage(href: string, x: number, y: number, w: number, h: number, r: number = 0) {
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
        r,
      },
    });
  }

  async copy() {
    if (this.state.getSelected().length <= 0) return;
    await navigator.clipboard.writeText(JSON.stringify(this.state.getSelected()));
  }

  async cut() {
    if (this.state.getSelected().length <= 0) return;
    await this.copy();
    this.store.send({
      type: "request_delete",
      delete: this.state.getSelected().map(token => token.id)
    })
  }

  async paste() {
    const json = await navigator.clipboard.readText();
    const parsed: Token[] = JSON.parse(json);

    if (!Array.isArray(parsed)) throw "Pasted data is not a JSON array.";
    // TODO validate data is actual tokens.

    const offset = 20;
    const pastedTokens = parsed.map((token) => ({
      ...token,
      x: token.x + offset,
      y: token.y + offset,
    }));

    await navigator.clipboard.writeText(JSON.stringify(pastedTokens));
    for (const token of pastedTokens) {
      const type = token.type;
      switch (type) {
        case "circle":
          this.createCircle(token.border, token.color, token.x, token.y, token.w, token.h, token.r);
          break;

        case "rectangle":
          this.createRectangle(token.border, token.color, token.x, token.y, token.w, token.h, token.r);
          break;

        case "image":
          this.createImage(token.href, token.x, token.y, token.w, token.h, token.r);
          break;

        default:
          throw `Unsupported paste-type '${type}'`;
      }
    }
  }
}

export default TokenDrawController;
