import {SET_USER, CLEAR_USER, SET_CURRENT_CHANNEL, SET_PRIVATE_CHANNEL, SET_USER_POSTS} from "./types";


export const setUser = user => {
  return {
    type: SET_USER,
    payload: {
      currentUser: user
    }
  }
};

export const clearUser = () => {
  return {
    type: CLEAR_USER,
  }
};


export const setCurrentChannel = channel => {
  return {
    type: SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel
    }
  }
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  }
};


export const setUserPosts = posts => {
  return {
    type: SET_USER_POSTS,
    payload: {
      posts
    }
  }
};