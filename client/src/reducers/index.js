import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'
import userReducer from './user'
import patients from './patients'
import statistics from './statistics'
import referrals from './referrals'

export default combineReducers({
  counter,
  posts,
  user: userReducer,
  patients,
  statistics,
  referrals
})
