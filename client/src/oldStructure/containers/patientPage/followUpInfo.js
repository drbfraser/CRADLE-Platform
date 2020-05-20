import React from 'react'
import PropTypes from 'prop-types'
import { Divider, Segment, Header } from 'semantic-ui-react'
import { followupFrequencyUnitUnit } from '../../components/FollowUp/FollowUpModal'
import { getPrettyDateTime } from '../../utils'

function FollowUpInfo(props) {
  if (props.followUp) {
    let frequencyStr = ""
    if(props.followUp.followupFrequencyValue != null &&
      props.followUp.followupFrequencyUnit != followupFrequencyUnitUnit['none'] &&
      props.followUp.dateFollowupNeededTill != null) {
      frequencyStr = 'Every ' + props.followUp.followupFrequencyValue + ' ' +props.followUp.followupFrequencyUnit.toLowerCase() + ' until ' + props.followUp.dateFollowupNeededTill
    }
    return (
            <Segment>
                <Header size="small">Special Investigations + Results:</Header>
                <p>{props.followUp.specialInvestigations || 'N/A'}</p>
                <Divider />
                <Header size="small">Final Diagnosis:</Header>
                <p>{props.followUp.diagnosis || 'N/A'}</p>
                <Divider />
                <Header size="small">Treatment/Operation:</Header>
                <p>{props.followUp.treatment || 'N/A'}</p>
                <Divider />
                <Header size="small">Medication Prescribed:</Header>
                <p>{props.followUp.medicationPrescribed || 'N/A'}</p>
                <Divider />
                <Header size="small">Frequency:</Header>
                <p> {frequencyStr || 'N/A'} </p>
                <Divider />
                <Header size="small">Followup Instructions:</Header>
                <p>{props.followUp.followupInstructions || 'N/A'}</p>
                <Divider />
                <p>
                    <b>Assessed By:</b> Healthcare Worker{' '}
                    {props.followUp.healthcareWorkerId}
                </p>
                <p>
                    <b>Date Last Assessed:</b>{' '}
                    {getPrettyDateTime(props.followUp.dateAssessed)}
                </p>
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
