import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'

export default combineReducers({
  counter,
  posts
})
