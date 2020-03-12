import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Segment, Header} from 'semantic-ui-react';

function FollowUpInfo(props) {
    if (props.followUp) {
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
              <p>Every {props.followUp.followupFrequencyValue} {props.followUp.followupFrequencyUnit.toLowerCase()} until {props.followUp.dateFollowupNeededTill}</p>
              <Divider />
              <Header size='small'>Instructions:</Header>
              <p>{props.followUp.followupInstructions}</p>
              <Divider />
              <p><b>Assessed By:</b> Healthcare Worker {props.followUp.healthcareWorkerId}</p>
              <p><b>Date Last Assessed:</b> {props.followUp.dateAssessed}</p>
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

