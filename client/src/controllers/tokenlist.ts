import type { StateListenerMap } from "../state";
import type State from "../state";
import type Store from "../store";
import type TokenListView from "../views/tokenlist";
import { TokenController } from "./controller";

class TokenListController extends TokenController<TokenListView> {
  constructor(store: Store, state: State, view: TokenListView) {
    super(store, state, view);

    this.view.listen("tokens_select", (selected) => this.state.selectTokens(selected));

    // Bit inefficient, but should be fine
    const listens = [
      "token_delete",
      "token_create",
      "token_select",
      "token_transform",
      "token_layer_change",
    ] as (keyof StateListenerMap)[];
    for (const listen of listens) {
      this.state.listen(listen, () => this.view.update(this.state.getTokens(), this.state.getSelected()));
    }
  }
}

export default TokenListController;
