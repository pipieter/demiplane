interface AbstractToken {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TokenCircle extends AbstractToken {
  type: "circle";
  color: string;
}

export interface TokenRectangle extends AbstractToken {
  type: "rectangle";
  color: string;
}

export interface TokenImage extends AbstractToken {
  type: "image";
  href: string;
}

export type Token = TokenCircle | TokenImage | TokenRectangle;
