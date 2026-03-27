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
  // TODO - lines use w and h for their x2 and y2, this could be confusing and should be probably be changed.
  // We could retain this behavior and make it so the w and h are the relative distance from x and y,
  // but this would just convolutes things.
  type: "line";
  color: string;
  width: number;
}

export type Token = TokenCircle | TokenImage | TokenRectangle | TokenLine;
