import moment from 'moment';

export function getPrettyDate(dateStr) {
    return this.getMomentDate(dateStr).format("MMMM Do YYYY, h:mm:ss a");
}

export function getMomentDate(dateStr) {
    var dateStr = dateStr.slice(0,19)
    return moment(dateStr);
}