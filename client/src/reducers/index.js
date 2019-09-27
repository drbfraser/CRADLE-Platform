import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'
import user from './user'

export default combineReducers({
  counter,
  posts,
  user
})
