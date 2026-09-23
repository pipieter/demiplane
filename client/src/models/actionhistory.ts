import type { CreateRequestMessage, DeleteRequestMessage, RequestMessage, TransformRequestMessage } from "../messages";

export type ActionMessage = TransformRequestMessage | CreateRequestMessage | DeleteRequestMessage;

function isActionMessage(message: RequestMessage): message is ActionMessage {
  return message.type === "request_transform" || message.type === "request_create" || message.type === "request_delete";
}

function getActionTokenID(message: RequestMessage): string[] | null {
  switch (message.type) {
    case "request_create":
      return [message.create.id];

    case "request_delete":
      return message.delete;

    case "request_transform":
      return [message.transform.id];

    default:
      return null;
  }
}

class ActionHistory {
  private lastActions: ActionMessage[];

  constructor() {
    this.lastActions = [];
  }

  private get bufferSize() {
    return 5;
  }

  add(message: RequestMessage) {
    if (!isActionMessage(message)) return;

    const tokenId = getActionTokenID(message);
    if (!tokenId) return;

    const isDuplicate = this.lastActions.some((action) => JSON.stringify(action) === JSON.stringify(message));
    if (isDuplicate) return;

    this.lastActions.push(message);
    if (this.lastActions.length > this.bufferSize) {
      this.lastActions.shift();
    }
  }
}

export default ActionHistory;
