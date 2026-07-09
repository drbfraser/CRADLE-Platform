import { Box, Typography } from '@mui/material';
import { LocalHospital as DiagnosisIcon } from '@mui/icons-material';
import { Assessment } from 'src/shared/types/assessmentTypes';
import { RedirectButton } from 'src/shared/components/Button';
import { getPrettyDateTime } from 'src/shared/utils';
import { CardContainer } from './CardContainer';

interface IAssessmentCardProps {
  assessment: Assessment;
}

export const AssessmentCard = ({ assessment }: IAssessmentCardProps) => (
  <CardContainer>
    <Typography variant={'h5'} component={'h5'}>
      <DiagnosisIcon fontSize="large" />
      Assessment
    </Typography>

    <Box px={3}>
      {Boolean(assessment && assessment.healthcareWorkerId) && (
        <p>
          <b>Assessed By: </b> Healthcare Worker:
          {assessment?.healthcareWorkerId}
        </p>
      )}

      {Boolean(assessment && assessment.dateAssessed) && (
        <p>
          <b>Date Last Assessed: </b>
          {getPrettyDateTime(assessment?.dateAssessed)}
        </p>
      )}

      {Boolean(assessment && assessment.specialInvestigations) && (
        <p>
          <b>Special Investigations + Results: </b>
          {assessment?.specialInvestigations}
        </p>
      )}

      {Boolean(assessment && assessment.diagnosis) && (
        <p>
          <b>Final Diagnosis: </b>
          {assessment?.diagnosis}
        </p>
      )}

      {Boolean(assessment && assessment.treatment) && (
        <p>
          <b>Treatment/Operation: </b>
          {assessment?.treatment}
        </p>
      )}

      {Boolean(assessment && assessment.medicationPrescribed) && (
        <p>
          <b>Medication Prescribed: </b>
          {assessment?.medicationPrescribed}
        </p>
      )}

      {Boolean(assessment && assessment.followUpInstructions) && (
        <p>
          <b>Followup Instructions: </b>
          {assessment?.followUpInstructions}
        </p>
      )}
    </Box>

    <RedirectButton
      disabled={!assessment}
      url={`/assessments/edit/${assessment.patientId}/${assessment.id}`}>
      Update Assessment
    </RedirectButton>
  </CardContainer>
);
