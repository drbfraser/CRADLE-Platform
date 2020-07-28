import { Divider, Header, Segment } from 'semantic-ui-react';
import { FollowUp, OrNull } from '@types';

import React from 'react';
import { getPrettyDateTime } from '../../../../../../../shared/utils';
import { useFrequency } from './hooks';

interface IProps {
  followUp: OrNull<FollowUp>;
}

export const FollowUpInfo: React.FC<IProps> = ({ followUp }) => {
  const frequency = useFrequency({ followUp });

  return followUp ? (
    <Segment>
      <Header size="small">Special Investigations + Results:</Header>
      <p>{followUp?.specialInvestigations || 'N/A'}</p>
      <Divider />
      <Header size="small">Final Diagnosis:</Header>
      <p>{followUp?.diagnosis || 'N/A'}</p>
      <Divider />
      <Header size="small">Treatment/Operation:</Header>
      <p>{followUp?.treatment || 'N/A'}</p>
      <Divider />
      <Header size="small">Medication Prescribed:</Header>
      <p>{followUp?.medicationPrescribed || 'N/A'}</p>
      <Divider />
      <Header size="small">Frequency:</Header>
      <p>{frequency}</p>
      <Divider />
      <Header size="small">Followup Instructions:</Header>
      <p>{followUp?.followupInstructions || 'N/A'}</p>
      <Divider />
      <p>
        <b>Assessed By:</b> Healthcare Worker {followUp?.healthcareWorkerId}
      </p>
      <p>
        <b>Date Last Assessed:</b> {getPrettyDateTime(followUp?.dateAssessed)}
      </p>
    </Segment>
  ) : null;
};
