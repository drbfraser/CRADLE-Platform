import axios from 'axios';
import BASE_URL from '../serverUrl'

export const newReadingPost = (patient,reading) => {
    return dispatch => {
        return fetch(BASE_URL + "/patient/reading", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(patient,reading)
        }).then(resp => resp.json())
            .then(data => {
                console.log(data)
                if (data.message) {
                    dispatch({
                        type: 'CREATE_ERROR',
                        payload: data.message
                    })
                } else {
                    dispatch({
                        type: 'CREATE_SUCCESS'
                    })
                }
            })
    }
}

  