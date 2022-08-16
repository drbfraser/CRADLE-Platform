import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import {
  AssignmentInd,
  AssignmentLate,
  LocalHospital as DiagnosisIcon,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { CustomizedForm, FollowUp, Reading, Referral } from 'src/shared/types';

import { RedirectButton } from 'src/shared/components/Button';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { getPrettyDateTime } from 'src/shared/utils';

interface IFollowUpCardProps {
  followUp: FollowUp;
}

export const AssessmentCard = ({ followUp }: IFollowUpCardProps) => (
  <>
    <Typography variant="h5">
      <DiagnosisIcon fontSize="large" />
      Assessment
    </Typography>

    <Box px={3}>
      {Boolean(followUp && followUp.healthcareWorkerId) && (
        <p>
          <b>Assessed By: </b> Healthcare Worker:{followUp?.healthcareWorkerId}
        </p>
      )}

      {Boolean(followUp && followUp.dateAssessed) && (
        <p>
          <b>Date Last Assessed: </b>
          {getPrettyDateTime(followUp?.dateAssessed)}
        </p>
      )}

      {Boolean(followUp && followUp.specialInvestigations) && (
        <p>
          <b>Special Investigations + Results: </b>
          {followUp?.specialInvestigations}
        </p>
      )}

      {Boolean(followUp && followUp.diagnosis) && (
        <p>
          <b>Final Diagnosis: </b>
          {followUp?.diagnosis}
        </p>
      )}

      {Boolean(followUp && followUp.treatment) && (
        <p>
          <b>Treatment/Operation: </b>
          {followUp?.treatment}
        </p>
      )}

      {Boolean(followUp && followUp.medicationPrescribed) && (
        <p>
          <b>Medication Prescribed: </b>
          {followUp?.medicationPrescribed}
        </p>
      )}

      {Boolean(followUp && followUp.followupInstructions) && (
        <p>
          <b>Followup Instructions: </b>
          {followUp?.followupInstructions}
        </p>
      )}
    </Box>

    <RedirectButton
      disabled={!followUp}
      url={`/assessments/edit/${followUp.patientId}/${followUp.id}`}>
      Update Assessment
    </RedirectButton>
  </>
);

interface ICustomizedFormCardProps {
  form: CustomizedForm;
}

export const CustomizedFormCard = ({ form }: ICustomizedFormCardProps) => (
  <>
    <Typography variant="h5">
      <>
        <AssignmentInd fontSize="large" /> {form.classification.name}
      </>
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        {`Last Edit : ${getPrettyDateTime(form.lastEdited)}`}
      </Typography>
    </Box>

    <RedirectButton url={`/forms/edit/${form.patientId}/${form.id}`}>
      View & Edit Form
    </RedirectButton>
  </>
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
    <>
      <Typography variant="h5">
        <AssignmentInd fontSize="large" />
        Reading
      </Typography>

      <Box px={3}>
        <TrafficLight
          style={{ margin: '5px' }}
          status={reading.trafficLightStatus}
        />
        <p>
          <b>Systolic Blood Pressure:</b> {reading.bpSystolic} mm/Hg
        </p>
        <p>
          <b>Diastolic Blood Pressure:</b> {reading.bpDiastolic} mm/Hg
        </p>
        <p>
          <b>Heart Rate:</b> {reading.heartRateBPM} bpm
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
                    value: reading.urineTests.urineTestLeuc,
                  },
                  {
                    label: 'Nitrites',
                    value: reading.urineTests.urineTestNit,
                  },
                  {
                    label: 'Glucose',
                    value: reading.urineTests.urineTestGlu,
                  },
                  {
                    label: 'Protein',
                    value: reading.urineTests.urineTestPro,
                  },
                  {
                    label: 'Blood',
                    value: reading.urineTests.urineTestBlood,
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
    </>
  );
};

interface IReferralCardProps {
  referral: Referral;
}

export const ReferralAssessedCard = ({ referral }: IReferralCardProps) => (
  <>
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
        Referred to {referral.referralHealthFacilityName}
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
  </>
);

export const ReferralCancelledCard = ({ referral }: IReferralCardProps) => (
  <>
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
        Referred to {referral.referralHealthFacilityName}
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
  </>
);

export const ReferralNotAttendedCard = ({ referral }: IReferralCardProps) => (
  <>
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
        Referred to {referral.referralHealthFacilityName}
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
  </>
);

export const ReferralPendingCard = ({ referral }: IReferralCardProps) => (
  <>
    <Typography variant="h5">
      <AssignmentLate fontSize="large" /> Referral Pending
    </Typography>

    <Box px={3}>
      <Typography variant="subtitle1">
        Referred on {getPrettyDateTime(referral.dateReferred)}
      </Typography>
      <Typography variant="subtitle1">
        Referred to {referral.referralHealthFacilityName}
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
  </>
);
