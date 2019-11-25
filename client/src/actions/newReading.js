import BASE_URL from '../serverUrl'
import { getPatients } from './patients'

export const newReadingPost = (reading) => {
    return dispatch => {
        return fetch(BASE_URL + "/patient/reading", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(reading)
        }).then(resp => resp.json())
            .then(data => {
                console.log(data)
                if (data.message) {
                    dispatch({
                        type: 'CREATE_SUCCESS',
                        payload: data.message
                    })
                    dispatch(getPatients())
                } else {
                    dispatch({
                        type: 'CREATE_ERROR'
                    })
                }
            })
    }
}

  