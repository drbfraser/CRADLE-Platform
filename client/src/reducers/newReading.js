import { CREATE_READING_SUCCESS, CREATE_READING_ERR, CREATE_READING_DEFAULT } from "../actions/newReading"

//import all the actions here

const createReadingStatus =  (state = {}, action) => {
    switch (action.type) {
        case CREATE_READING_SUCCESS:
            return { 
                message : action.payload.data, 
                error : false,
                readingCreated: true
            }
            
        case CREATE_READING_ERR:
            return { 
                message : "Error! Patient reading not created.", 
                error : true,
                readingCreated: false
            }
        
        case CREATE_READING_DEFAULT:
        default:
            return { 
                error : false,
                readingCreated: false
            }
    }
}

export default createReadingStatus