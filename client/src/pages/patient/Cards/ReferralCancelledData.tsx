import React from 'react';
import {
  Typography,
  Button,
  // Accordion,
  // AccordionSummary,
  // AccordionDetails,
  Grid,
} from '@material-ui/core';
// import AddIcon from '@material-ui/icons/Add';
// import red from '@material-ui/core/colors/red';
// import { ThemeProvider } from '@material-ui/styles';
// import { createTheme } from "@material-ui/core/styles";
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
// import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
// import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Referral } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';


interface IProps {
  referral: Referral;
}

export const ReferralCancelledData = ({ referral }: IProps) => {
  const history = useHistory();
  // const referral = reading.referral!;
  // const followUp = reading.followup;
 

  const handleUndoCancellation = () => {
    console.log("handleUndoCancellation");
    if (referral) {
      history.push(`/referrals/cancel-status-switch/${referral.id}/undo_cancel_referral`);
    }
  };


  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Cancelled
          </>
        </Typography>
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

         {/* // //////////////////////////// */}
         <Grid item>
          <Grid container alignItems="flex-start" style={{ gap: 7 }}>
            <Button color="primary" variant="outlined" onClick={handleUndoCancellation}>
              Undo Cancellation
            </Button> 
          </Grid>
        </Grid>
        {/* // //////////////////////////// */}

 
      </>
    </>
  );
};
