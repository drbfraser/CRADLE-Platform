import { Divider, Header, Segment } from 'semantic-ui-react';

import React from 'react';
import { followupFrequencyUnitOptions } from '../utils';
import { getPrettyDateTime } from '../../../../../utils';

interface IProps {
  followUp: any;
}

export const FollowUpInfo: React.FC<IProps> = ({ followUp }) => {
  if (followUp) {
    const displayFollowUpFrequency =
      followUp.followupFrequencyValue !== null &&
      followUp.followupFrequencyUnit !== followupFrequencyUnitOptions[0].value &&
      followUp.dateFollowupNeededTill !== null;

    const frequencyStr = displayFollowUpFrequency
      ? `Every ${
          followUp.followupFrequencyValue
        } ${followUp.followupFrequencyUnit.toLowerCase()} until ${
          followUp.dateFollowupNeededTill
        }`
      : ``;
      
    return (
      <Segment>
        <Header size="small">Special Investigations + Results:</Header>
        <p>{followUp.specialInvestigations || `N/A`}</p>
        <Divider />
        <Header size="small">Final Diagnosis:</Header>
        <p>{followUp.diagnosis || `N/A`}</p>
        <Divider />
        <Header size="small">Treatment/Operation:</Header>
        <p>{followUp.treatment || `N/A`}</p>
        <Divider />
        <Header size="small">Medication Prescribed:</Header>
        <p>{followUp.medicationPrescribed || `N/A`}</p>
        <Divider />
        <Header size="small">Frequency:</Header>
        <p> {frequencyStr || `N/A`} </p>
        <Divider />
        <Header size="small">Followup Instructions:</Header>
        <p>{followUp.followupInstructions || `N/A`}</p>
        <Divider />
        <p>
          <b>Assessed By:</b> Healthcare Worker{` `}
          {followUp.healthcareWorkerId}
        </p>
        <p>
          <b>Date Last Assessed:</b>{` `}
          {getPrettyDateTime(followUp.dateAssessed)}
        </p>
      </Segment>
    );
  } 

  return null;
}
