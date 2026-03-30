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
  stroke: number;
}

export function isToken(obj: Token): boolean {
  const isBaseValid =
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    typeof obj.x === "number" &&
    typeof obj.y === "number" &&
    typeof obj.w === "number" &&
    typeof obj.h === "number" &&
    typeof obj.r === "number";

  if (!isBaseValid) return false;

  switch (obj.type) {
    case "circle":
    case "rectangle":
      return typeof obj.color === "string" && (typeof obj.border === "number" || obj.border === null);

    case "image":
      return typeof obj.href === "string";

    case "line":
      return typeof obj.color === "string" && typeof obj.stroke === "number";

    default:
      return false;
  }
}

export type Token = TokenCircle | TokenImage | TokenRectangle | TokenLine;
