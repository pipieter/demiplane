import type Background from "../models/background";
import type { Server } from "../server";
import { util } from "../util";
import type BackgroundView from "../views/background";

class BackgroundController {
  private server: Server;
  private model: Background;
  private view: BackgroundView;

  constructor(server: Server, model: Background, view: BackgroundView) {
    this.server = server;
    this.model = model;
    this.view = view;

    this.view.bindBackgroundUpload((file) => this.request(file));
  }

  public set(href: string | null, width: number, height: number) {
    this.model.set(href, width, height);
    this.view.set(href, width, height);
  }

  public async request(file: File) {
    const base64 = await util.readBase64(file);
    if (!base64) throw `Could not read file data.`;

    const href = await this.server.uploadImage(base64);
    this.server.send({ type: "request_background", href });
  }
}

export default BackgroundController;
