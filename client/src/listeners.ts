import { Listener } from "./listener";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface TokenListenerMap {
  token_transform: Transform;
  token_continuous_transform: Transform; // A special transform event where a token is continuously moved every frame, for performance reasons
  tokens_select: Token[];
  tokens_delete: Token[];
  token_layer_change: [Token, number];
}

export class TokenListener extends Listener<TokenListenerMap> {}
