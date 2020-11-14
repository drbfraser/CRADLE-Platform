import { PatientAction } from './actions';
import { initialState, PatientState } from './state'
import { validateField } from './validation';

export const reducer = (state = initialState, action: any): PatientState => {
    if(action.type === PatientAction.SET_FIELD) {
        switch(action.field) {
            default:
                return {
                    ...state,
                    [action.field]: action.value,
                    error: {
                        ...state.error,
                        [action.field]: !validateField(action.field, action.value)
                    }
                }
        }
    } else if (action.type === PatientAction.CLEAR_FORM) {
        return {
            ...initialState,
            error: {
                ...initialState.error
            }
        }
    }
    else {
        return state;
    }
}