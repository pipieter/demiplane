import type Background from "../models/background";
import type { Server } from "../server";
import type State from "../state";
import { util } from "../util";
import type BackgroundView from "../views/background";

class BackgroundController {
  private server: Server;
  private state: State;
  private view: BackgroundView;

  constructor(server: Server, state: State, view: BackgroundView) {
    this.server = server;
    this.state = state;
    this.view = view;

    this.view.listen("background_upload", (file) => this.upload(file));
    this.state.listen("background_change", (background) => this.update(background));
  }

  public update(background: Background) {
    this.view.set(background.href, background.width, background.height);
  }

  public async upload(file: File) {
    const base64 = await util.readBase64(file);
    if (!base64) throw `Could not read file data.`;

    const href = await this.server.uploadImage(base64);
    this.server.send({ type: "request_background", href });
  }
}

export default BackgroundController;
