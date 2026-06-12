import { Box, Typography } from '@mui/material';
import { AssignmentLate } from '@mui/icons-material';
import { Referral } from 'src/shared/types/referralTypes';
import { RedirectButton } from 'src/shared/components/Button';
import { getPrettyDateTime } from 'src/shared/utils';
import { CardContainer } from './CardContainer';

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
