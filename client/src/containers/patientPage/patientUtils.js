import { ReactComponent as GreenTraffic } from './drawable/green.svg'
import { Icon } from 'semantic-ui-react'
import React from 'react'
import { ReactComponent as RedTraffic } from './drawable/red.svg'
import { ReactComponent as YellowTraffic } from './drawable/yellow.svg'
import { getMomentDate } from '../../utils'

export const trafficLights = [
    `GREEN`,
    `YELLOW_UP`,
    `YELLOW_DOWN`,
    `RED_UP`,
    `RED_DOWN`,
];

export const getTrafficIcon = trafficLightStatus => {
    if (trafficLightStatus === 'RED_DOWN') {
        return (
            <div>
                <RedTraffic style={{ height: '65px', width: '65px' }} />
                <Icon name="arrow down" size="huge" />
            </div>
        )
    } else if (trafficLightStatus === 'RED_UP') {
        return (
            <div>
                <RedTraffic style={{ height: '65px', width: '65px' }} />
                <Icon name="arrow up" size="huge" />
            </div>
        )
    } else if (trafficLightStatus === 'YELLOW_UP') {
        return (
            <div>
                <YellowTraffic style={{ height: '65px', width: '65px' }} />
                <Icon name="arrow up" size="huge" />
            </div>
        )
    } else if (trafficLightStatus === 'YELLOW_DOWN') {
        return (
            <div>
                <YellowTraffic style={{ height: '65px', width: '65px' }} />
                <Icon name="arrow down" size="huge" />
            </div>
        )
    } else {
        return <GreenTraffic style={{ height: '65px', width: '65px' }} />
    }
}

export const getLatestReading = readings => {
    let sortedReadings = readings.sort(
        (a, b) =>
            getMomentDate(b.dateTimeTaken).valueOf() -
            getMomentDate(a.dateTimeTaken).valueOf()
    )
    return sortedReadings[0]
}

export const getLatestReadingDateTime = readings => {
    return getLatestReading(readings).dateTimeTaken
}

export const sortPatientsByLastReading = (a, b) =>
    getMomentDate(getLatestReadingDateTime(b.readings)).valueOf() -
    getMomentDate(getLatestReadingDateTime(a.readings)).valueOf()
