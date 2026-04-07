import server from "./server";
import BackgroundView from "./views/background";
import BackgroundController from "./controllers/background";
import State from "./state";
import Store from "./store";
import TokenMapView from "./views/tokenmap";
import TokenMapController from "./controllers/tokenmap";
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
import HoverView from "./views/hover";
import HoverController from "./controllers/hover";
import ServerStatusView from "./views/serverstatus";
import ServerStatusController from "./controllers/serverstatus";
import type { ResponseMessage } from "./messages";

const state = new State();
const store = new Store(server.url);

const tokenView = new TokenMapView();
const backgroundView = new BackgroundView();
const transformView = new TransformView(state.grid);
const selectionView = new SelectionView();
const serverStatusView = new ServerStatusView();
const tokenDrawView = new TokenDrawView(state.grid);
const gridView = new GridView();
const headerView = new SidebarView();
const tokenEditView = new TokenEditView();
const tokenListView = new TokenListView();
const userView = new UserView();
const hoverView = new HoverView();

new BackgroundController(store, state, backgroundView);
new TokenMapController(store, state, tokenView);
new TransformController(store, state, transformView);
new SelectionController(store, state, selectionView);
new ServerStatusController(store, state, serverStatusView);
new TokenDrawController(store, state, tokenDrawView);
new GridController(store, state, gridView);
new SidebarController(store, state, headerView);
new TokenEditController(store, state, tokenEditView);
new TokenListController(store, state, tokenListView);
new UserController(store, state, userView);
new HoverController(store, state, hoverView);

store.listen("message", (event) => {
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
      state.clearTokens();
      state.clearSelected();
      state.setGrid(data.grid);
      state.setBackground(data.background.href, data.background.width, data.background.height);
      state.createTokens(data.tokens);
      state.setUsers(data.users);
      store.setSecretToken(data.secret);
      state.setMe(data.me);
      break;

    case "layer_change":
      state.setTokenLayer(data.tokenId, data.layer);
      break;

    case "error":
      alert(`An error has occurred, re-syncing. '${data.message}'`);
      store.send({ type: "request_sync", secret: store.getSecretToken() });
      break;

    default:
      throw `Unknown message type: ${JSON.stringify(data)}`;
  }
});
