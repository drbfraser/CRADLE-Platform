import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { Referral } from 'src/shared/types';
import { Typography } from '@mui/material';
import { getPrettyDate } from 'src/shared/utils';
interface IProps {
  referral: Referral;
}

export const ReferralNotAttendedData = ({ referral }: IProps) => {
  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Not Attended
          </>
        </Typography>
        <Typography variant="subtitle1">
          Referred on {getPrettyDate(referral.dateReferred)}
        </Typography>
        <Typography variant="subtitle1">
          Marked Not Attended on {getPrettyDate(referral.dateNotAttended)}
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
      </>
    </>
  );
};
