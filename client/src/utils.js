import moment from 'moment';

export function getPrettyDateTime(dateStr) {
    return getMomentDate(dateStr).format("DD.MM.YY, h:mm:ss a");
}

export function getPrettyDate(dateStr) {
    return getMomentDate(dateStr).format("DD.MM.YY");
}

export function getMomentDate(dateS) {
    dateS = dateS.slice(0,19)
    return moment(dateS);
}