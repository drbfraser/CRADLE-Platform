import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'
import user from './user'
import patients from './patients'
import statistics from './statistics'

export default combineReducers({
  counter,
  posts,
  user,
  patients,
  statistics
})
