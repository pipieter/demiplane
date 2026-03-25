import { Listener, ListenerContainer } from "./listener";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface TokenListenerMap {
  token_transform: Transform;
  token_transform_finish: Transform;
  tokens_select: Token[];
  tokens_delete: Token[];
}

class TokenListener extends Listener<TokenListenerMap> {
  protected override keys(): (keyof TokenListenerMap)[] {
    return ["token_transform", "tokens_select", "tokens_delete"];
  }
}

export class TokenListenerContainer extends ListenerContainer<TokenListener, TokenListenerMap> {
  constructor() {
    super(new TokenListener());
  }
}
