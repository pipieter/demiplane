import type { CreateRequestMessage, DeleteRequestMessage, RequestMessage, TransformRequestMessage } from "../messages";

export type ActionMessage = TransformRequestMessage | CreateRequestMessage | DeleteRequestMessage;

function isActionMessage(message: RequestMessage): message is ActionMessage {
  return message.type === "request_transform" || message.type === "request_create" || message.type === "request_delete";
}

class ActionHistory {
  private lastActions: ActionMessage[];

  constructor() {
    this.lastActions = [];
  }

  add(message: RequestMessage) {
    if (!isActionMessage(message)) return;

    const lastAction = this.lastActions.at(-1);
    if (JSON.stringify(lastAction) === JSON.stringify(message)) return;

    this.lastActions.push(message);
  }
}

export default ActionHistory;
