import axios from 'axios';
import BASE_URL from '../serverUrl'

export const GET_STATISTICS = 'posts/GET_STATISTICS'
export const GET_STATISTICS_REQUESTED = 'posts/GET_STATISTICS_REQUESTED'
export const GET_STATISTICS_ERR = 'posts/GET_POSTS_ERR'

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