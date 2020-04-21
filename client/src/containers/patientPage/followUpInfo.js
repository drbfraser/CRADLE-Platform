import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Segment, Header} from 'semantic-ui-react';
import {followupFrequencyUnitUnit} from '../../components/FollowUp/FollowUpModal'

function FollowUpInfo(props) {
  if (props.followUp) {
    let dateAssessed = String(new Date(parseInt(props.followUp.dateAssessed, 10) * 1000)).substring(0,15)
    let frequencyStr = ""
    if(props.followUp.followupFrequencyValue != null &&
      props.followUp.followupFrequencyUnit != followupFrequencyUnitUnit['none'] &&
      props.followUp.dateFollowupNeededTill != null) {
      let dateFromTS = String(new Date(parseInt(props.followUp.dateFollowupNeededTill, 10) * 1000)).substring(0,15)
      frequencyStr = 'Every ' + props.followUp.followupFrequencyValue + ' ' +props.followUp.followupFrequencyUnit.toLowerCase() + ' until ' + dateFromTS
    }
    return (
            <Segment>
              <Header size='small'>Follow Up Action:</Header>
              <p>{props.followUp.followUpAction}</p>
              <Divider />
              <Header size='small'>Diagnosis:</Header>
              <p>{props.followUp.diagnosis}</p>
              <Divider />
              <Header size='small'>Treatment:</Header>
              <p>{props.followUp.treatment}</p>
              <Divider />
              <Header size='small'>Frequency:</Header>
              <p> {frequencyStr} </p>
              <Divider />
              <Header size='small'>Instructions:</Header>
              <p>{props.followUp.followupInstructions}</p>
              <Divider />
              <p><b>Assessed By:</b> Healthcare Worker {props.followUp.healthcareWorkerId}</p>
              <p><b>Date Last Assessed:</b> {dateAssessed}</p>
            </Segment>
        )
    } else {
        return null
    }
}

FollowUpInfo.propTypes = {
    followUp: PropTypes.object.isRequired
}

export default FollowUpInfo

