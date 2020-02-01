import { requestActionCreator } from './api';
import { Endpoint, Method } from '../api/constants';

export const GET_STATISTICS = 'posts/GET_STATISTICS'
export const GET_STATISTICS_REQUESTED = 'posts/GET_STATISTICS_REQUESTED'
export const GET_STATISTICS_ERR = 'posts/GET_POSTS_ERR'

export const GET_SELECTEDPATIENTSTATS = 'posts/GET_SELECTEDPATIENTSTATS'
export const GET_SELECTEDPATIENTSTATS_REQUESTED = 'posts/GET_SELECTEDPATIENTSTATS_REQUESTED'
export const GET_SELECTEDPATIENTSTATS_ERR = 'posts/GET_SELECTEDPATIENTSTATS_ERR'

export const getStatistics = () => {
    return requestActionCreator(
        Endpoint.STATS,
        Method.GET,
        null,
        getStatisticsOnSuccess,
        getStatisticsOnError
    )
}   

const getStatisticsOnSuccess = response => ({
    type: GET_STATISTICS,
    payload: response
})

const getStatisticsOnError = error => ({
    type: GET_STATISTICS_ERR,
    payload: error
})

export const getSelectedPatientStats = (patientId) => {
    return requestActionCreator(
        Endpoint.PATIENT + Endpoint.STATS + '/' + patientId,
        Method.GET,
        null,
        getSelectedPatientStatsOnSuccess,
        getSelectedPatientStatsOnError
    )
}

export const getSelectedPatientStatsRequested = () => ({
    type: GET_SELECTEDPATIENTSTATS_REQUESTED
})

const getSelectedPatientStatsOnSuccess = response => ({
    type: GET_SELECTEDPATIENTSTATS,
    payload: response
})

const getSelectedPatientStatsOnError = error => ({
    type: GET_SELECTEDPATIENTSTATS_ERR,
    payload: error
})
