export const CREATE_ROOM = 'chat/CREATE_ROOM'
export const JOIN_ROOM = 'chat/JOIN_ROOM'

export const createRoom = () => {
    return dispatch => {
        dispatch({
            type: CREATE_ROOM
        })
    }
}

export const joinRoom = () => {
    return dispatch => {
        dispatch({
            type: JOIN_ROOM
        })
    }
}
