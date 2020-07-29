import { Assessment as AssessmentType, OrNull } from '@types';
import { Divider, Header, Segment } from 'semantic-ui-react';

import React from 'react';
import { getPrettyDateTime } from '../../../../../../shared/utils';

interface IProps {
  assessment: OrNull<AssessmentType>;
}

export const Assessment: React.FC<IProps> = ({ assessment }) => {
  return assessment ? (
    <Segment>
      <Header size="small">Special Investigations + Results:</Header>
      <p>{assessment?.specialInvestigations || 'N/A'}</p>
      <Divider />
      <Header size="small">Final Diagnosis:</Header>
      <p>{assessment?.diagnosis || 'N/A'}</p>
      <Divider />
      <Header size="small">Treatment/Operation:</Header>
      <p>{assessment?.treatment || 'N/A'}</p>
      <Divider />
      <Header size="small">Medication Prescribed:</Header>
      <p>{assessment?.medicationPrescribed || 'N/A'}</p>
      <Divider />
      <Header size="small">Followup Instructions:</Header>
      <p>{assessment?.followupInstructions || 'N/A'}</p>
      <Divider />
      <p>
        <b>Assessed By:</b> Healthcare Worker {assessment?.healthcareWorkerId}
      </p>
      <p>
        <b>Date Last Assessed:</b> {getPrettyDateTime(assessment?.dateAssessed)}
      </p>
    </Segment>
  ) : null;
};
