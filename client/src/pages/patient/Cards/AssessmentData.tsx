import React from 'react';
import { Typography } from '@material-ui/core';
import { FollowUp } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import DiagnosisIcon from '@material-ui/icons/LocalHospital';
import { useHistory } from 'react-router-dom';
import { SecondaryButton } from '../../../shared/components/SecondaryButton/index';

interface IProps {
  followUp: FollowUp;
}

export const AssessmentData = ({ followUp }: IProps) => {
  const history = useHistory();

  const handleAssessmentClick = () => {
    if (followUp) {
      history.push(`/assessments/edit/${followUp.patientId}/${followUp.id}`);
    }
  };

  return (
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
          {getPrettyDateTime(followUp?.dateAssessed)}
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
      <SecondaryButton
        text="Update Assessment"
        task={handleAssessmentClick}
      />
    </>
  );
};
