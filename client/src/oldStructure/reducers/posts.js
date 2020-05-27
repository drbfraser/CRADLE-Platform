// import all the actions here

import {
  UPDATE_POSTS,
  UPDATE_POSTS_REQUESTED,
  UPDATE_POSTS_ERR,
  UPDATE_MSG
} from '../actions/posts'

const initialState = {
  posts: [],
  isFetchingPosts: false,
  msg: ''
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_POSTS:
      return {
        ...state,
        posts: action.payload,
        isLoading: false
      }

    case UPDATE_POSTS_REQUESTED:
      return {
        ...state,
        isLoading: true
      }

    case UPDATE_POSTS_ERR:
      return {
        ...state,
        isLoading: false
      }

    case UPDATE_MSG:
      return {
        ...state,
        msg: action.payload.msg
      }

    default:
      return state
  }
}
