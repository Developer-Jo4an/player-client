import {configureStore} from '@reduxjs/toolkit'
import rootReducer from "./reducer/rootReducer";
import requests from "./reducer/requests";
import logger from "./middleware/logger";
import storage from '../utils/storage'

const preloadedState = {};

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) => {
    let middleware = getDefaultMiddleware();
    if (process.env.NODE_ENV === "development")
      middleware = middleware.concat(logger)
    return middleware;
  },
});

export default store;
