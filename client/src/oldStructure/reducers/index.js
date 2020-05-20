import { combineReducers } from 'redux'
import counter from './counter'
import posts from './posts'
import userReducer from './user'
import patients from './patients'
import statistics from './statistics'
import referrals from './referrals'
import patientStats from './patientStats'
import healthFacilities from './healthFacilities'
import newReading from './newReading'
import chat from './chat'


const appReducer = combineReducers({
  counter,
  posts,
  user: userReducer,
  patients,
  statistics,
  referrals,
  patientStats,
  healthFacilities,
  newReading,
  chat
})

export default (state, action) => {
  if (action.type === 'LOGOUT_USER') {
    state = undefined
  }
  return appReducer(state,action)
}
