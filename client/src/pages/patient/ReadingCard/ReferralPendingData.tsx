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
import red from '@material-ui/core/colors/red';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from "@material-ui/core/styles";
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
// import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
// import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Reading } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';


interface IProps {
  reading: Reading;
}

export const ReferralData = ({ reading }: IProps) => {
  const history = useHistory();
  const referral = reading.referral!;
  const followUp = reading.followup;


  const redTheme = createTheme({ palette: { primary: red } })


  const handleReferralAssess = () => {
    console.log("handleReferralAssess");
    if (followUp) {
      history.push(
        `/assessments/edit/${reading.patientId}/${reading.readingId}/${followUp.id}`
      );
    } 
  };

  const handleReferralNotAttend = () => {
    console.log("handleReferralNotAttend");
  };

  const handleReferralCancel = () => {
    console.log("handleReferralCancel");
  };


  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> Referral Pending
          </>
        </Typography>
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

        {/* // //////////////////////////// */}
        <Grid item>
          <Grid container alignItems="flex-start" style={{ gap: 7 }}>
            <Button color="primary" variant="outlined" onClick={handleReferralAssess}>
              Assess Referral
            </Button>
            <Button color="primary" variant="outlined" onClick={handleReferralNotAttend}>
              Did Not Attend
            </Button>

            <ThemeProvider theme={redTheme}>
              <Button color="primary" variant="outlined" onClick={handleReferralCancel}>
                Cancel
              </Button>
            </ThemeProvider>
          </Grid>
        </Grid>
        {/* // //////////////////////////// */}
      </>
    </>
  );
};
