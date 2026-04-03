import { Listener } from "./listener";
import type { Token } from "./models/token";
import type { Transform } from "./models/transform";

interface TokenListenerMap {
  token_transform: Transform;
  token_transform_finish: Transform;
  tokens_select: Token[];
  tokens_delete: Token[];
  tokens_select_area: DOMRect;
}

export class TokenListener extends Listener<TokenListenerMap> {}
