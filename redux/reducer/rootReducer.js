import {combineReducers} from '@reduxjs/toolkit'
import controllerReducer from "../../components/controller/reducer/controller";
import user from "./user";
import requests from "./requests";


const rootReducer = combineReducers({
  controllerReducer,
  [requests.name]: requests.reducer,
  [user.name]: user.reducer,
});


export default rootReducer;
