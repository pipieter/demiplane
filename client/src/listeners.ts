import { Listener } from "./listener";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface TokenListenerMap {
  token_transform: Transform;
  token_transform_finish: Transform;
  tokens_select: Token[];
  tokens_delete: Token[];
  token_layer_change: [Token, number];
}

export class TokenListener extends Listener<TokenListenerMap> {}
