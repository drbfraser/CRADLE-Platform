import { Endpoint, Method } from '../api/constants';

import { requestActionCreator } from './api';

export const GET_STATISTICS = 'posts/GET_STATISTICS'
export const GET_STATISTICS_REQUESTED = 'posts/GET_STATISTICS_REQUESTED'
export const GET_STATISTICS_ERR = 'posts/GET_POSTS_ERR'

export const GET_SELECTED_PATIENTS_STATS = 'posts/GET_SELECTED_PATIENTS_STATS'
export const GET_SELECTED_PATIENTS_STATS_REQUESTED = 'posts/GET_SELECTED_PATIENTS_STATS_REQUESTED'
export const GET_SELECTED_PATIENTS_STATS_ERR = 'posts/GET_SELECTED_PATIENTS_STATS_ERR'

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
    type: GET_SELECTED_PATIENTS_STATS_REQUESTED
})

const getSelectedPatientStatsOnSuccess = response => ({
    type: GET_SELECTED_PATIENTS_STATS,
    payload: response
})

const getSelectedPatientStatsOnError = error => ({
    type: GET_SELECTED_PATIENTS_STATS_ERR,
    payload: error
})
