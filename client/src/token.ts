export interface CreationDataCircle {
  type: "circle";
  color: string;
  x: number;
  y: number;
  r: number;
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

export interface TokenImage {
  id: string;
  type: "image";
  href: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type CreationData = CreationDataCircle | CreationDataImage;
export type Token = TokenCircle | TokenImage;
