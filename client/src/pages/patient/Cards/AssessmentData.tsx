import DiagnosisIcon from '@material-ui/icons/LocalHospital';
import { FollowUp } from 'src/shared/types';
import React from 'react';
import { RedirectButton } from 'src/shared/components/Button';
import { Typography } from '@material-ui/core';
import { getPrettyDate } from 'src/shared/utils';

interface IProps {
  followUp: FollowUp;
}

export const AssessmentData = ({ followUp }: IProps) => (
  <>
    <Typography variant="h5">
      <DiagnosisIcon fontSize="large" />
      Assessment
    </Typography>

    {Boolean(followUp && followUp.healthcareWorkerId) && (
      <p>
        <b>Assessed By:</b> Healthcare Worker:{followUp?.healthcareWorkerId}
      </p>
    )}

    {Boolean(followUp && followUp.dateAssessed) && (
      <p>
        <b>Date Last Assessed:</b>
        {getPrettyDate(followUp?.dateAssessed)}
      </p>
    )}

    {Boolean(followUp && followUp.specialInvestigations) && (
      <p>
        <b>Special Investigations + Results:</b>
        {followUp?.specialInvestigations}
      </p>
    )}

    {Boolean(followUp && followUp.diagnosis) && (
      <p>
        <b>Final Diagnosis:</b>
        {followUp?.diagnosis}
      </p>
    )}

    {Boolean(followUp && followUp.treatment) && (
      <p>
        <b>Treatment/Operation:</b>
        {followUp?.treatment}
      </p>
    )}

    {Boolean(followUp && followUp.medicationPrescribed) && (
      <p>
        <b>Medication Prescribed:</b>
        {followUp?.medicationPrescribed}
      </p>
    )}

    {Boolean(followUp && followUp.followupInstructions) && (
      <p>
        <b>Followup Instructions:</b>
        {followUp?.followupInstructions}
      </p>
    )}
    <RedirectButton
      disabled={!followUp}
      url={`/assessments/edit/${followUp.patientId}/${followUp.id}`}>
      Update Assessment
    </RedirectButton>
  </>
);
