import type { ResponseMessage } from "./messages";
import { util } from "./util";
import server from "./server";
import BackgroundView from "./views/background";
import BackgroundController from "./controllers/background";
import State from "./state";
import Store from "./store";
import TokenView from "./views/token";
import TokenController from "./controllers/token";
import TransformController from "./controllers/transform";
import TransformView from "./views/transform";
import SelectionView from "./views/selection";
import SelectionController from "./controllers/selection";
import TokenDrawView from "./views/tokendraw";
import TokenDrawController from "./controllers/tokendraw";
import GridView from "./views/grid";
import GridController from "./controllers/grid";
import SidebarView from "./views/sidebar";
import SidebarController from "./controllers/sidebar";
import TokenEditView from "./views/tokenedit";
import TokenEditController from "./controllers/tokenedit";
import TokenListView from "./views/tokenlist";
import TokenListController from "./controllers/tokenlist";
import UserView from "./views/user";
import UserController from "./controllers/user";

const socket = new WebSocket(server.url);
const store = new Store(server.url, socket);
const state = new State();

const grid = state.getGrid();
const viewport = state.getViewport();

const tokenView = new TokenView();
const backgroundView = new BackgroundView();
const transformView = new TransformView(grid, viewport);
const selectionView = new SelectionView();
const tokenDrawView = new TokenDrawView(grid, viewport);
const gridView = new GridView();
const headerView = new SidebarView();
const tokenEditView = new TokenEditView();
const tokenListView = new TokenListView();
const userView = new UserView();

new BackgroundController(store, state, backgroundView);
new TokenController(store, state, tokenView);
new TransformController(store, state, transformView);
new SelectionController(store, state, selectionView);
new TokenDrawController(store, state, tokenDrawView);
new GridController(store, state, gridView);
new SidebarController(store, state, headerView);
new TokenEditController(store, state, tokenEditView);
new TokenListController(store, state, tokenListView);
new UserController(store, state, userView);

socket.onmessage = function (event) {
  const data = JSON.parse(event.data) as ResponseMessage;

  switch (data.type) {
    case "create":
      state.createToken(data.create);
      break;

    case "delete":
      state.removeTokens(data.delete);
      break;

    case "grid":
      state.setGrid(data.grid);
      break;

    case "background": {
      state.setBackground(data.background.href, data.background.width, data.background.height);
      break;
    }

    case "transform":
      state.transformToken(data.transform);
      break;

    case "user_change":
      state.setUser(data.user);
      break;

    case "user_disconnect":
      state.removeUser(data.userId);
      break;

    case "sync":
      state.setGrid(data.grid);
      state.setBackground(data.background.href, data.background.width, data.background.height);
      state.createTokens(data.tokens);
      state.setUsers(data.users);
      store.setSecretToken(data.secret);
      state.setMe(data.me);
      break;

    default:
      throw `Unknown message type: ${JSON.stringify(data)}`;
  }
};

const uploadTokenInput = document.getElementById("upload-token-button") as HTMLInputElement;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 600),
  };
}

uploadTokenInput.addEventListener("change", async (evt: Event) => {
  const file = (evt.target as HTMLInputElement).files?.item(0);
  if (!file) throw "Could not open file.";

  const base64 = await util.readBase64(file);
  if (!base64) throw "Could not read file.";

  const href = await store.uploadImage(base64);
  if (!href) throw "Could not upload image to server.";

  const { x, y } = getRandomPosition();
  const w = grid.size;
  const h = grid.size;

  store.send({
    type: "request_create",
    create: {
      type: "image",
      id: crypto.randomUUID(),
      href,
      x,
      y,
      w,
      h,
      r: 0,
    },
  });
});
