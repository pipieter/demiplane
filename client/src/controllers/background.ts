import type Background from "../models/background";
import type State from "../state";
import type Store from "../store";
import { util } from "../util";
import type BackgroundView from "../views/background";
import Controller from "./controller";

class BackgroundController extends Controller<BackgroundView> {
  constructor(store: Store, state: State, view: BackgroundView) {
    super(store, state, view);

    this.view.listen("background_upload", (file) => this.upload(file));
    this.state.listen("background_change", (background) => this.update(background));
  }

  public update(background: Background) {
    this.view.set(background.href, background.width, background.height);
  }

  public async upload(file: File) {
    const base64 = await util.readBase64(file);
    if (!base64) throw `Could not read file data.`;

    // Set the image locally
    const { href: localHref, width, height } = await util.createLocalImage(base64);
    this.state.setBackground(localHref, width, height);

    // Upload the image to the server
    const href = await this.store.uploadImage(base64);
    this.store.send({ type: "request_background", href });
  }
}

export default BackgroundController;
