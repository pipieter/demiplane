import type { Token } from "../models/token";
import type State from "../state";
import type Store from "../store";
import type TokenMapView from "../views/tokenmap";
import Controller from "./controller";

class TokenMapController extends Controller<TokenMapView> {
  constructor(store: Store, state: State, view: TokenMapView) {
    super(store, state, view);

    this.state.listen("token_create", (token) => this.create(token));
    this.state.listen("token_transform", ([token, _]) => this.redraw(token));
    this.state.listen("token_layer_change", ([token, layer]) => this.setlayer(token, layer));
    this.state.listen("token_delete", (ids) => this.remove(ids));
  }

  public create(token: Token) {
    this.view.create(token);
  }

  public redraw(token: Token) {
    this.view.redraw(token);
  }

  public remove(ids: string[]) {
    this.view.remove(ids);
  }

  public setlayer(token: Token, layer: number) {
    this.view.setlayer(token, layer);
  }
}

export default TokenMapController;
