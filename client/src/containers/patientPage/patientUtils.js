import React from 'react';
import { ReactComponent as GreenTraffic } from './drawable/green.svg';
import { ReactComponent as YellowTraffic } from './drawable/yellow.svg';
import { ReactComponent as RedTraffic } from './drawable/red.svg';
import { Icon } from 'semantic-ui-react'

export const getTrafficIcon = (trafficLightStatus) => {
    if (trafficLightStatus === "RED_DOWN") {
      return <div>
        <RedTraffic style={{ "height": "65px", "width": "65px" }} />
        <Icon name="arrow down" size="huge" />
      </div>
    } else if (trafficLightStatus === "RED_UP") {
      return <div>
        <RedTraffic style={{ "height": "65px", "width": "65px" }} />
        <Icon name="arrow up" size="huge" />
      </div>
    } else if (trafficLightStatus === "YELLOW_UP") {
      return <div>
        <YellowTraffic style={{ "height": "65px", "width": "65px" }} />
        <Icon name="arrow up" size="huge" />
      </div>
    } else if (trafficLightStatus === "YELLOW_DOWN") {
      return <div>
        <YellowTraffic style={{ "height": "65px", "width": "65px" }} />
        <Icon name="arrow down" size="huge" />
      </div>
    } else {
      return <GreenTraffic style={{ "height": "65px", "width": "65px" }} />
    }
  }