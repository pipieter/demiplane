interface AbstractToken {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

export interface TokenCircle extends AbstractToken {
  type: "circle";
  color: string;
  border: number | null; // if null, completely filled and no border
}

export interface TokenRectangle extends AbstractToken {
  type: "rectangle";
  color: string;
  border: number | null; // if null, completely filled and no border
}

export interface TokenImage extends AbstractToken {
  type: "image";
  href: string;
}

export interface TokenLine extends AbstractToken {
  type: "line";
  color: string;
  width: number;
}

export type Token = TokenCircle | TokenImage | TokenRectangle | TokenLine;
