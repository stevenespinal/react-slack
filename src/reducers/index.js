import {CLEAR_USER, SET_USER, SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS} from "../actions/types";
import {combineReducers} from "redux";

const initialUserState = {
  currentUser: null,
  isLoading: true,
  isPrivateChannel: false
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case CLEAR_USER:
      return {
        ...state,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  posts: null
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      };
    case SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      };
    case SET_USER_POSTS:
      return {
        ...state,
        posts: action.payload.posts
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer
});


export default rootReducer;