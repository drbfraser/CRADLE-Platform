//import all the actions here

const createReadingStatus =  (state = {}, action) => {
    switch (action.type) {
        case 'CREATE_SUCCESS':
            return { 
                message : "Success! New reading has been successfully created", 
                error : false
            }
            
        case 'CREATE_ERROR':
            return { 
                message : action.payload, 
                error : true
            }
            
        default:
            return {}
    }
}

export default createReadingStatus