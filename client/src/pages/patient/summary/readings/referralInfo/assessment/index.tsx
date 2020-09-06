import { Divider, Header, Segment } from 'semantic-ui-react';
import { FollowUp, OrNull } from '@types';

import React from 'react';
import { getPrettyDateTime } from '../../../../../../shared/utils';

interface IProps {
  followUp: OrNull<FollowUp>;
}

export const Assessment: React.FC<IProps> = ({ followUp }) => {
  return followUp ? (
    <Segment>
      {followUp.specialInvestigations && (
        <>
          <Header size="small">Special Investigations + Results:</Header>
          <p>{followUp.specialInvestigations}</p>
          <Divider />
        </>
      )}
      {followUp.diagnosis && (
        <>
          <Header size="small">Final Diagnosis:</Header>
          <p>{followUp.diagnosis}</p>
          <Divider />
        </>
      )}
      {followUp.treatment && (
        <>
          <Header size="small">Treatment/Operation:</Header>
          <p>{followUp.treatment}</p>
          <Divider />
        </>
      )}
      {followUp.medicationPrescribed && (
        <>
          <Header size="small">Medication Prescribed:</Header>
          <p>{followUp.medicationPrescribed || 'N/A'}</p>
          <Divider />
        </>
      )}
      {followUp.followupInstructions && (
        <>
          <Header size="small">Followup Instructions:</Header>
          <p>{followUp.followupInstructions}</p>
          <Divider />
        </>
      )}
      <p>
        <b>Assessed By: </b>
        {`Healthcare Worker ${followUp.healthcareWorkerId}` ?? `N/A`}
      </p>
      <p>
        <b>Date Last Assessed:</b> {getPrettyDateTime(followUp.dateAssessed)}
      </p>
    </Segment>
  ) : null;
};
