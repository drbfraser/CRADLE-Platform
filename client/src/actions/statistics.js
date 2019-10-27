import axios from 'axios';
import BASE_URL from '../serverUrl'

export const GET_STATISTICS = 'posts/GET_STATISTICS'
export const GET_STATISTICS_REQUESTED = 'posts/GET_STATISTICS_REQUESTED'
export const GET_STATISTICS_ERR = 'posts/GET_POSTS_ERR'

export const GET_SELECTEDPATIENTSTATS = 'posts/GET_SELECTEDPATIENTSTATS'
export const GET_SELECTEDPATIENTSTATS_REQUESTED = 'posts/GET_SELECTEDPATIENTSTATS_REQUESTED'
export const GET_SELECTEDPATIENTSTATS_ERR = 'posts/GET_SELECTEDPATIENTSTATS_ERR'

export const getStatistics = () => {
    return dispatch => {
        dispatch({
            type: GET_STATISTICS_REQUESTED
        })

        axios.get(BASE_URL + "/stats").then((res) => {
            // console.log("get statistics: ", res);
            dispatch({
                type: GET_STATISTICS,
                payload: res.data
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: GET_STATISTICS_ERR
            })
        })
    }
}   

export const getSelectedPatientStats = (patientId) => {
    return dispatch => {
        dispatch({
            type: GET_SELECTEDPATIENTSTATS_REQUESTED
        })
        
        axios.get(BASE_URL + "/patient/stats/" + patientId).then((res) => {
            dispatch({
                type: GET_SELECTEDPATIENTSTATS,
                payload: res.data
            })
        }).catch(err => {
            console.log(err);
            dispatch({
                type: GET_SELECTEDPATIENTSTATS_ERR
            })
        })
    }
}
