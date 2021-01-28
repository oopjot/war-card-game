import game from "./game/reducers";
import user from "./user/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";

const rootReducer = combineReducers({ user, game });

const store = createStore(rootReducer, applyMiddleware(logger));

export default store;