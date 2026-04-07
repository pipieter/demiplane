import type State from "../state";
import type Store from "../store";
import type TokenEditView from "../views/tokenedit";
import { TokenController } from "./controller";

class TokenEditController extends TokenController<TokenEditView> {
  constructor(store: Store, state: State, view: TokenEditView) {
    super(store, state, view);

    this.state.listen("token_select", ([_, selected]) => this.view.select(selected));
    this.state.listen("token_transform", ([_, transform]) => this.view.update(transform));
  }
}

export default TokenEditController;
