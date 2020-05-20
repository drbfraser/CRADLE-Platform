import { push } from 'connected-react-router'

export const CREATE_ROOM = 'chat/CREATE_ROOM'
export const JOIN_ROOM = 'chat/JOIN_ROOM'

export const createRoom = (roomId) => {
    return dispatch => {
        dispatch({
            type: CREATE_ROOM,
            payload: roomId
        })
        dispatch(
            push('/chat/session/' + roomId)
        )
    }
}

export const joinRoom = (roomId) => {
    return dispatch => {
        dispatch({
            type: JOIN_ROOM,
            payload: roomId
        })
        dispatch(
            push('/chat/session/' + roomId)
        )
    }
}
