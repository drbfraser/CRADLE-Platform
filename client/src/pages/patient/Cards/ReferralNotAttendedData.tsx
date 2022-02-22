import React from 'react';
import { Typography } from '@material-ui/core';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import { Referral } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
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
      </>
    </>
  );
};
