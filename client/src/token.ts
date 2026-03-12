export interface CreationDataCircle {
  type: "circle";
  color: string;
  x: number;
  y: number;
  r: number;
}

export interface CreationDataRectangle {
  type: "rectangle";
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CreationDataImage {
  type: "image";
  data: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TokenCircle {
  id: string;
  type: "circle";
  color: string;
  x: number;
  y: number;
  r: number;
}

export interface TokenRectangle {
  id: string;
  type: "rectangle";
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TokenImage {
  id: string;
  type: "image";
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type CreationData = CreationDataCircle | CreationDataImage | CreationDataRectangle;
export type Token = TokenCircle | TokenImage | TokenRectangle;
