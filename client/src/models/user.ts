import type { Point } from "./transform";

export interface User {
  id: string;
  name: string;
  color: string;
  cursorPosition: Point | null;
}
