import type { GridData } from "./grid";
import type { Token, CreationData } from "./token";

/** Sync the current board state */
export interface SyncResponseMessage {
  type: "sync";
  background: {
    href: string | null;
    width: number;
    height: number;
  };
  grid: GridData;
  tokens: Token[];
}

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

/** Move a token the board */
export interface MoveResponseMessage {
  type: "move";
  move: {
    id: string;
    x: number;
    y: number;
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

export type RequestMessage = CreateRequestMessage | MoveRequestMessage | GridRequestMessage | BackgroundRequestMessage;
export type ResponseMessage =
  | SyncResponseMessage
  | CreateResponseMessage
  | MoveResponseMessage
  | GridResponseMessage
  | BackgroundResponseMessage;
