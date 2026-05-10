import type { BackgroundLayer } from "../models/background";
import type State from "../state";
import type Store from "../store";
import { util } from "../util";
import type BackgroundListView from "../views/backgroundlist";
import Controller from "./controller";

class BackgroundListController extends Controller<BackgroundListView> {
  constructor(store: Store, state: State, view: BackgroundListView) {
    super(store, state, view);

    this.view.listen("background_upload", (file) => this.upload(file));
    this.view.listen("background_layer_rename", ([id, name]) => this.renameLayer(id, name));
    this.view.listen("background_layer_delete", (id) => this.deleteLayer(id));
    this.view.listen("background_layer_select", (id) => this.selectLayer(id));

    this.state.listen("background_change", (background) => this.view.update(background));
  }

  public async upload(file: File) {
    // Upload a background layer to the server and set it immediately
    const id = crypto.randomUUID();
    const name = "Unnamed background";

    const base64 = await util.readBase64(file);
    if (!base64) throw `Could not read file data.`;

    // Set the image locally
    const { href: localHref, width, height } = await util.createLocalImage(base64);
    const localLayer: BackgroundLayer = { id, name, href: localHref, width, height };
    this.state.addBackgroundLayer(localLayer);
    this.state.selectBackgroundLayer(id);

    // Upload the background to the server
    const href = await this.store.uploadImage(base64);
    const layer: BackgroundLayer = { id, name, href, width, height };
    this.store.send({ type: "request_background_add_layer", layer });
    this.store.send({ type: "request_background_select_layer", id });
  }

  public deleteLayer(id: string) {
    this.state.deleteBackgroundLayer(id);
    this.store.send({ type: "request_background_delete_layer", id });

    // If deleting the current background layer, set the background to null
    if (id === this.state.getCurrentBackgroundLayer()) {
      this.state.selectBackgroundLayer(null);
      this.store.send({ type: "request_background_select_layer", id: null });
    }
  }

  public renameLayer(id: string, name: string) {
    this.state.renameBackgroundLayer(id, name);
    this.store.send({ type: "request_background_rename_layer", id, name });
  }

  public selectLayer(id: string) {
    this.state.selectBackgroundLayer(id);
    this.store.send({ type: "request_background_select_layer", id });
  }
}

export default BackgroundListController;
