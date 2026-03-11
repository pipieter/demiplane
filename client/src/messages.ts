import type { Token, CreationData } from "./token";

/** Request to create a token on the drawing board */
export interface CreateRequestMessage {
  type: "request_create";
  create: CreationData;
}

/** Create a token on the drawing board */
export interface CreateResponseMessage {
  type: "create";
  create: Token;
}

/** Request to move a token on the drawing board */
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

export type RequestMessage = CreateRequestMessage | MoveRequestMessage;
export type ResponseMessage = CreateResponseMessage | MoveResponseMessage;
