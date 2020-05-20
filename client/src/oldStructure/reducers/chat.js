// import all the actions here

import {
    CREATE_ROOM,
    JOIN_ROOM
} from '../actions/chat';

const initialState = {
    roomId: "",
    isOpener: false
}

export default (state = initialState, action) => {
    switch (action.type) {
        case CREATE_ROOM:
            return {
                ...state,
                isOpener: true,
                roomId: action.payload
            }
        
        case JOIN_ROOM:
            return {
                ...state,
                isOpener: false,
                roomId: action.payload
            }

        default:
            return state
    }
}