import { Listener, ListenerContainer } from "./listener";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface TokenListenerMap {
  token_transform: Transform;
  tokens_select: Token[];
}

class TokenListener extends Listener<TokenListenerMap> {
  protected override keys(): (keyof TokenListenerMap)[] {
    return ["token_transform", "tokens_select"];
  }
}

export class TokenListenerContainer extends ListenerContainer<TokenListener, TokenListenerMap> {
  constructor() {
    super(new TokenListener());
  }
}
