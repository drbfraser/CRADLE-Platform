import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import {
  AssignmentInd,
  AssignmentLate,
  LocalHospital as DiagnosisIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { Referral } from 'src/shared/types/referralTypes';
import { Assessment } from 'src/shared/types/assessmentTypes'
import { Reading } from 'src/shared/types/readingTypes';
import { CustomizedForm } from 'src/shared/types/form/formTypes';

import { RedirectButton } from 'src/shared/components/Button';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { getPrettyDateTime } from 'src/shared/utils';
import { PropsWithChildren } from 'react';

interface IAssessmentCardProps {
  assessment: Assessment;
}

const CardContainer = ({ children }: PropsWithChildren) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        my: 1,
        backgroundColor: '#f9f9f9',
      }}>
      {children}
    </Paper>
  );
};

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

interface ICustomizedFormCardProps {
  form: CustomizedForm;
}

export const CustomizedFormCard = ({ form }: ICustomizedFormCardProps) => (
  <CardContainer>
    <Typography variant={'h5'} component={'h5'}>
      <>
        <AssignmentInd fontSize="large" /> {form.classification.name}
      </>
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        {`Last Edit : ${getPrettyDateTime(form.lastEdited)}`}
      </Typography>
    </Box>

    <RedirectButton url={`/forms/view/${form.patientId}/${form.id}`}>
      View Form
    </RedirectButton>
  </CardContainer>
);

interface IReadingCardProps {
  reading: Reading;
}

export const ReadingCard = ({ reading }: IReadingCardProps) => {
  const firstLetterUppercase = (str: string) => {
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <CardContainer>
      <Typography variant={'h5'} component={'h5'}>
        <AssignmentInd fontSize="large" />
        Reading
      </Typography>

      <Box px={3}>
        <TrafficLight
          style={{ margin: '5px' }}
          status={reading.trafficLightStatus}
        />
        <p>
          <b>Systolic Blood Pressure:</b> {reading.systolicBloodPressure} mm/Hg
        </p>
        <p>
          <b>Diastolic Blood Pressure:</b> {reading.diastolicBloodPressure}{' '}
          mm/Hg
        </p>
        <p>
          <b>Heart Rate:</b> {reading.heartRate} bpm
        </p>
        {Boolean(reading.symptoms?.length) && (
          <p>
            <b>Symptoms: </b>
            {reading.symptoms?.map((s) => firstLetterUppercase(s)).join(', ')}
          </p>
        )}
        {reading.urineTests && (
          <Accordion>
            <AccordionSummary expandIcon={<KeyboardArrowDown />}>
              <Typography>
                <b>Urine Test Result</b>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                {[
                  {
                    label: 'Leukocytes',
                    value: reading.urineTests.leukocytes,
                  },
                  {
                    label: 'Nitrites',
                    value: reading.urineTests.nitrites,
                  },
                  {
                    label: 'Glucose',
                    value: reading.urineTests.glucose,
                  },
                  {
                    label: 'Protein',
                    value: reading.urineTests.protein,
                  },
                  {
                    label: 'Blood',
                    value: reading.urineTests.blood,
                  },
                ].map((info) => (
                  <p key={info.label}>
                    <b>{info.label}:</b> {info.value}
                  </p>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </CardContainer>
  );
};

interface IReferralCardProps {
  referral: Referral;
}

export const ReferralAssessedCard = ({ referral }: IReferralCardProps) => (
  <CardContainer>
    <Typography variant="h5">
      <AssignmentLate fontSize="large" /> Referral Assessed
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Assessed on {getPrettyDateTime(referral.dateAssessed)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {referral.healthFacilityName}
      </Typography>
      {Boolean(referral.comment) && (
        <div>
          <Typography>
            <b>Referral Comment:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.comment}</Typography>
        </div>
      )}
    </Box>
  </CardContainer>
);

export const ReferralCancelledCard = ({ referral }: IReferralCardProps) => (
  <CardContainer>
    <Typography variant="h5">
      <AssignmentLate fontSize="large" /> Referral Cancelled
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Cancelled on {getPrettyDateTime(referral.dateCancelled)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {referral.healthFacilityName}
      </Typography>
      {Boolean(referral.comment) && (
        <div>
          <Typography>
            <b>Referral Comment:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.comment}</Typography>
        </div>
      )}
      {Boolean(referral.cancelReason) && (
        <div>
          <Typography>
            <b>Cancellation Reason:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.cancelReason}</Typography>
        </div>
      )}
    </Box>

    <RedirectButton
      url={`/referrals/cancel-status-switch/${referral.id}/undo_cancel_referral`}>
      Undo Cancellation
    </RedirectButton>
  </CardContainer>
);

export const ReferralNotAttendedCard = ({ referral }: IReferralCardProps) => (
  <CardContainer>
    <Typography variant="h5">
      <AssignmentLate fontSize="large" /> Referral Not Attended
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Marked Not Attended on {getPrettyDateTime(referral.dateNotAttended)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {referral.healthFacilityName}
      </Typography>
      {Boolean(referral.comment) && (
        <div>
          <Typography>
            <b>Not Attend Comment:</b>
          </Typography>
          <Typography variant="subtitle1">
            {referral.notAttendReason}
          </Typography>
        </div>
      )}
    </Box>
  </CardContainer>
);

export const ReferralPendingCard = ({ referral }: IReferralCardProps) => (
  <CardContainer>
    <Typography variant="h5">
      <AssignmentLate fontSize="large" /> Referral Pending
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {referral.healthFacilityName}
      </Typography>
      {Boolean(referral.comment) && (
        <div>
          <Typography>
            <b>Referral Comment:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.comment}</Typography>
        </div>
      )}
    </Box>

    <Box display={'flex'} flexDirection={'row'} style={{ gap: 5 }}>
      <RedirectButton
        url={`/assessments/new/${referral.patientId}/${referral.id}`}>
        Assess Referral
      </RedirectButton>
      <RedirectButton
        url={`/referrals/not-attend/${referral.id}/not_attend_referral`}>
        Did Not Attend
      </RedirectButton>
      <RedirectButton
        color="primary"
        url={`/referrals/cancel-status-switch/${referral.id}/cancel_referral`}>
        Cancel
      </RedirectButton>
    </Box>
  </CardContainer>
);
