import type { Token } from "../models/token";
import type { Transform } from "../models/transform";
import type State from "../state";
import type Store from "../store";
import type TokenEditView from "../views/tokenedit";
import Controller from "./controller";

class TokenEditController extends Controller<TokenEditView> {
  constructor(store: Store, state: State, view: TokenEditView) {
    super(store, state, view);

    this.view.listen("token_transform", ({ id, x, y, w, h }) => this.requestTransform(id, x, y, w, h));
    this.state.listen("token_select", ([_, selected]) => this.onselect(selected));
    this.state.listen("token_transform", ([_, transform]) => this.ontransform(transform));
  }

  private requestTransform(id: string, x: number, y: number, w: number, h: number) {
    this.store.send({
      type: "request_transform",
      transform: {
        id,
        x,
        y,
        w,
        h,
      },
    });
  }

  private ontransform(transform: Transform) {
    this.view.update(transform);
  }

  private onselect(tokens: Token[]) {
    this.view.select(tokens);
  }
}

export default TokenEditController;
