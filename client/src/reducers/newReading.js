//import all the actions here

const createReadingStatus =  (state = {}, action) => {
    switch (action.type) {
        case 'CREATE_SUCCESS':
            return { 
                message : action.payload, 
                error : false
            }
            
        case 'CREATE_ERROR':
            return { 
                message : "Error! Patient reading not created.", 
                error : true
            }
            
        default:
            return { error : false }
    }
}

export default createReadingStatus