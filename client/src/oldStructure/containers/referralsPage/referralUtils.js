import { getMomentDate } from '../../utils'

export const getLatestReferral = readings => {
    let sortedReadings = readings.sort(
        (a, b) =>
            getMomentDate(b.dateTimeTaken).valueOf() -
            getMomentDate(a.dateTimeTaken).valueOf()
    )

    if (sortedReadings[0].dateReferred) {
        return sortedReadings[0].dateReferred
    } else {
        return ''
    }
}

export const sortReferralsByDate = (a, b) =>
    getMomentDate(getLatestReferral(b.readings)).valueOf() -
    getMomentDate(getLatestReferral(a.readings)).valueOf()
