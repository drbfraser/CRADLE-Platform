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
      {assessment.specialInvestigations && (
        <>
          <Header size="small">Special Investigations + Results:</Header>
          <p>{assessment.specialInvestigations}</p>
          <Divider />
        </>
      )}
      {assessment.diagnosis && (
        <>
          <Header size="small">Final Diagnosis:</Header>
          <p>{assessment.diagnosis}</p>
          <Divider />
        </>
      )}
      {assessment.treatment && (
        <>
          <Header size="small">Treatment/Operation:</Header>
          <p>{assessment.treatment}</p>
          <Divider />
        </>
      )}
      {assessment.medicationPrescribed && (
        <>
          <Header size="small">Medication Prescribed:</Header>
          <p>{assessment.medicationPrescribed || 'N/A'}</p>
          <Divider />
        </>
      )}
      {assessment.followupInstructions && (
        <>
          <Header size="small">Followup Instructions:</Header>
          <p>{assessment.followupInstructions}</p>
          <Divider />
        </>
      )}
      <p>
        <b>Assessed By: </b>
        {`Healthcare Worker ${assessment.healthcareWorkerId}` ?? `N/A`}
      </p>
      <p>
        <b>Date Last Assessed:</b> {getPrettyDateTime(assessment.dateAssessed)}
      </p>
    </Segment>
  ) : null;
};
