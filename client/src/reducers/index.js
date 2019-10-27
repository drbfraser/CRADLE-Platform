import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'
import userReducer from './user'
import patients from './patients'
import statistics from './statistics'
import patientStats from './patientStats'

export default combineReducers({
  counter,
  posts,
  user: userReducer,
  patients,
  statistics,
  patientStats
})
