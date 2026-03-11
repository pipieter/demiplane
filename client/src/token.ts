export interface TokenId {
  id: string;
}

export interface TokenDataCircle {
  type: "circle";
  color: string;
  x: number;
  y: number;
  r: number;
}

export interface TokenCircle extends TokenDataCircle, TokenId {}

export type TokenData = TokenDataCircle;
export type Token = TokenCircle;
