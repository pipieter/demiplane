import type { Duplicate } from "../messages";
import { isToken, type Token, type TokenCircle, type TokenLine, type TokenRectangle } from "../models/token";
import type { Point } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import { util } from "../util";
import type TokenDrawView from "../views/tokendraw";
import Controller from "./controller";

class TokenDrawController extends Controller<TokenDrawView> {
  pasteOffset: Point = { x: 8, y: 8 };

  constructor(store: Store, state: State, view: TokenDrawView) {
    super(store, state, view);
    this.resetPasteOffset();

    this.view.listen("circle_create", ({ x, y, w, h, border, color }) => this.createCircle(border, color, x, y, w, h));
    this.view.listen("rectangle_create", ({ x, y, w, h, border, color }) =>
      this.createRectangle(border, color, x, y, w, h),
    );
    this.view.listen("line_create", ({ x1, y1, x2, y2, stroke, color }) =>
      this.createLine(x1, y1, x2, y2, stroke, color),
    );
    this.view.listen("image_create", ({ base64, x, y, w, h }) => this.createFreedraw(base64, x, y, w, h));

    document.addEventListener("copy", async () => {
      await this.copy();
    });

    document.addEventListener("cut", async () => {
      await this.cut();
    });

    document.addEventListener("paste", async () => {
      await this.paste();
    });
  }

  private createCircle(
    border: number | null,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number = 0,
  ) {
    const circle: TokenCircle = {
      type: "circle",
      id: crypto.randomUUID(),
      border,
      color,
      x,
      y,
      w,
      h,
      r,
    };

    this.state.createToken(circle);
    this.store.send({ type: "request_create", create: circle });
  }

  private createRectangle(
    border: number | null,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number = 0,
  ) {
    const rectangle: TokenRectangle = {
      type: "rectangle",
      id: crypto.randomUUID(),
      border,
      color,
      x,
      y,
      w,
      h,
      r,
    };

    this.state.createToken(rectangle);
    this.store.send({ type: "request_create", create: rectangle });
  }

  private createLine(x1: number, y1: number, x2: number, y2: number, stroke: number, color: string) {
    const line: TokenLine = {
      type: "line",
      id: crypto.randomUUID(),
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      stroke,
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

  private resetPasteOffset() {
    this.pasteOffset = { x: 8, y: 8 };
  }

  private async getImageClipboardBlob(tokens: Token[]): Promise<Blob | null> {
    if (tokens.length > 1) return null;
    if (tokens[0].type !== "image") return null;
    if (!tokens[0].href) return null;
    try {
      const response = await fetch(tokens[0].href);
      const blob = await response.blob();

      if (blob.type === "image/png" || blob.type === "image/jpeg") {
        return blob;
      }
    } catch {
      return null;
    }
    return null;
  }

  private async writeTokensToClipboard(tokens: Token[]) {
    this.resetPasteOffset();
    const clipboardData: Record<string, Blob> = {};
    const jsonString = JSON.stringify(tokens);
    clipboardData["text/plain"] = new Blob([jsonString], { type: "text/plain" });

    const imageBlob = await this.getImageClipboardBlob(tokens);
    if (imageBlob) clipboardData["image/png"] = imageBlob;

    const item = new ClipboardItem(clipboardData);
    await navigator.clipboard.write([item]);
  }

  async copy() {
    if (util.isUserTyping()) return;
    const selected = this.state.getSelected();
    if (selected.length <= 0) return;

    await this.writeTokensToClipboard(selected);
  }

  async cut() {
    if (util.isUserTyping()) return;
    const selected = this.state.getSelected();
    if (selected.length <= 0) return;

    await this.writeTokensToClipboard(selected);
    const ids = selected.map((token) => token.id);
    this.state.removeTokens(ids);
    this.store.send({
      type: "request_delete",
      delete: ids,
    });
  }

  async paste() {
    if (util.isUserTyping()) return;

    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        if (!item.types.includes("text/plain")) continue;

        const blob = await item.getType("text/plain");
        const json = await blob.text();
        const parsed: Token[] = JSON.parse(json);

        if (!Array.isArray(parsed)) return;

        const duplicatePairs: Duplicate[] = [];
        const newTokens = parsed
          .filter((token) => isToken(token))
          .map((token) => {
            const newToken = token;
            newToken.id = crypto.randomUUID();
            newToken.x += this.pasteOffset.x;
            newToken.y += this.pasteOffset.y;

            duplicatePairs.push({ parentId: token.id, childId: newToken.id });
            return newToken;
          });

        if (newTokens.length <= 0) return;

        this.state.createTokens(newTokens);
        this.store.send({
          type: "request_duplicate",
          duplicate: duplicatePairs,
          offset: this.pasteOffset
        });
      }
    } catch {
      return;
    }
  }
}

export default TokenDrawController;
