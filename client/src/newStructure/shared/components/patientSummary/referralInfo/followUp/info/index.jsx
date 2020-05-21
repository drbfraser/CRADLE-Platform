import { Divider, Header, Segment } from 'semantic-ui-react';

import PropTypes from 'prop-types';
import React from 'react';
import { followupFrequencyUnitOptions } from '../utils';
import { getPrettyDateTime } from '../../../../../utils';

export const FollowUpInfo = (props) => {
  if (props.followUp) {
    const displayFollowUpFrequency =
      props.followUp.followupFrequencyValue !== null &&
      props.followUp.followupFrequencyUnit !== followupFrequencyUnitOptions[`none`] &&
      props.followUp.dateFollowupNeededTill !== null;

    const frequencyStr = displayFollowUpFrequency
      ? `Every ${
          props.followUp.followupFrequencyValue
        } ${props.followUp.followupFrequencyUnit.toLowerCase()} until ${
          props.followUp.dateFollowupNeededTill
        }`
      : ``;
      
    return (
      <Segment>
        <Header size="small">Special Investigations + Results:</Header>
        <p>{props.followUp.specialInvestigations || `N/A`}</p>
        <Divider />
        <Header size="small">Final Diagnosis:</Header>
        <p>{props.followUp.diagnosis || `N/A`}</p>
        <Divider />
        <Header size="small">Treatment/Operation:</Header>
        <p>{props.followUp.treatment || `N/A`}</p>
        <Divider />
        <Header size="small">Medication Prescribed:</Header>
        <p>{props.followUp.medicationPrescribed || `N/A`}</p>
        <Divider />
        <Header size="small">Frequency:</Header>
        <p> {frequencyStr || `N/A`} </p>
        <Divider />
        <Header size="small">Followup Instructions:</Header>
        <p>{props.followUp.followupInstructions || `N/A`}</p>
        <Divider />
        <p>
          <b>Assessed By:</b> Healthcare Worker{` `}
          {props.followUp.healthcareWorkerId}
        </p>
        <p>
          <b>Date Last Assessed:</b>{` `}
          {getPrettyDateTime(props.followUp.dateAssessed)}
        </p>
      </Segment>
    );
  } 

  return null;
}

FollowUpInfo.propTypes = PropTypes.shape({
  followUp: PropTypes.object.isRequired,
}).isRequired;
