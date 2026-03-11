export interface TokenDataCircle {
  type: "circle";
  color: string;
  x: number;
  y: number;
  r: number;
}

export interface TokenCircle extends TokenDataCircle {
  id: string;
}

export type TokenData = TokenDataCircle;
export type Token = TokenCircle;
