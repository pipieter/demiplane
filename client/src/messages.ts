import type { GridData } from "./grid";
import type { Token, CreationData } from "./token";

/** Request to create a token on the whiteboard */
export interface CreateRequestMessage {
  type: "request_create";
  create: CreationData;
}

/** Create a token on the whiteboard */
export interface CreateResponseMessage {
  type: "create";
  create: Token;
}

/** Request to move a token on the whiteboard */
export interface MoveRequestMessage {
  type: "request_move";
  move: {
    id: string;
    x: number;
    y: number;
  };
}

/** Move a token on the board */
export interface MoveResponseMessage {
  type: "move";
  move: {
    id: string;
    x: number;
    y: number;
  };
}

/** Request to resize a token on the whiteboard */
export interface SizeRequestMessage {
  type: "request_size";
  size: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/** Resize a token on the board */
export interface SizeResponseMessage {
  type: "size";
  size: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/** Request the grid to be adjusted */
export interface GridRequestMessage {
  type: "request_grid";
  grid: GridData;
}

/** Adjust the grid */
export interface GridResponseMessage {
  type: "grid";
  grid: GridData;
}

/** Request to change the background image */
export interface BackgroundRequestMessage {
  type: "request_background";
  href: string;
}

/** Set the background image */
export interface BackgroundResponseMessage {
  type: "background";
  background: {
    href: string | null;
    width: number;
    height: number;
  };
}

export type RequestMessage = CreateRequestMessage | MoveRequestMessage | GridRequestMessage | SizeRequestMessage | BackgroundRequestMessage;
export type ResponseMessage =
  | CreateResponseMessage
  | MoveResponseMessage
  | GridResponseMessage | SizeResponseMessage
  | BackgroundResponseMessage;
