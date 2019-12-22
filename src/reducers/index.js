import {CLEAR_USER, SET_USER} from "../actions/types";
import {combineReducers} from "redux";

const initialState = {
  currentUser: null,
  isLoading: true
};

const user_reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case CLEAR_USER:
      return {
        ...initialState,
        isLoading: false
      };
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  user: user_reducer
});


export default rootReducer;