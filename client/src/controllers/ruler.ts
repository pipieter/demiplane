import type State from "../state";
import type Store from "../store";
import type RulerView from "../views/ruler";
import Controller from "./controller";

class RulerController extends Controller<RulerView> {
    constructor(store: Store, state: State, view: RulerView) {
        super(store, state, view);
    }
}

export default RulerController;