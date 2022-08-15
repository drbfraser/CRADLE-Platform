import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { Referral } from 'src/shared/types';
import { Typography } from '@mui/material';
import { getPrettyDate } from 'src/shared/utils';
interface IProps {
  referral: Referral;
}

export const ReferralAssessedData = ({ referral }: IProps) => {
  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Assessed
          </>
        </Typography>
        <Typography variant="subtitle1">
          Referred on {getPrettyDate(referral.dateReferred)}
        </Typography>
        <Typography variant="subtitle1">
          Assessed on {getPrettyDate(referral.dateAssessed)}
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
      </>
    </>
  );
};
