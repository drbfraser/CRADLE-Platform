import moment from 'moment';

export function getPrettyDate(dateStr) {
    return getMomentDate(dateStr).format("MMMM Do YYYY, h:mm:ss a");
}

export function getMomentDate(dateS) {
    dateS = dateS.slice(0,19)
    return moment(dateS);
}

export const getUserFromResponse = response => {
    return {
        email: response.email,
        roles: response.roles,
        firstName: response.firstName,
        healthFacilityName: response.healthFacilityName,
        userId: response.userId,
        vhtList: response.vhtList
    }
}