import React from 'react';
import { Grid, Paper, Box } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core';
import { Reading, Referral, FollowUp } from 'src/shared/types';
import { ReadingData } from './ReadingData';
import { AssessmentData } from './AssessmentData';
import { ReferralAssessedData } from './ReferralAssessedData';
import { ReferralCancelledData } from './ReferralCancelledData';
import { ReferralNotAttendedData } from './ReferralNotAttendedData';
import { ReferralPendingData } from './ReferralPendingData';
// import { useTheme } from '@material-ui/core/styles';
// import useMediaQuery from '@material-ui/core/useMediaQuery';

// const useStyles = makeStyles({
//   borderLeft: {
//     borderLeft: '2px solid #84ced4',
//   },
//   borderTop: {
//     borderTop: '2px solid #84ced4',
//   },
// });

interface IProps_Reading {
  reading: Reading;
}

interface IProps_Referral {
  referral: Referral;
}

interface IProps_Assessment {
  followUp: FollowUp;
}

export const ReadingCard = ({ reading }: IProps_Reading) => {
  //const styles = useStyles();
  //const theme = useTheme();
  //const isBigScreen = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReadingData reading={reading} />
          </Grid>
          {/* <Grid
            item
            xs={12}
            sm={6}
            className={isBigScreen ? styles.borderLeft : styles.borderTop}>
            <ReferralData reading={reading} />
          </Grid> */}
        </Grid>
      </Box>
    </Paper>
  );
};

export const AssessmentCard = ({ followUp }: IProps_Assessment) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <AssessmentData followUp={followUp} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

////////////////

export const ReferralPendingCard = ({ referral }: IProps_Referral) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReferralPendingData referral={referral} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

////////////////

export const ReferralCancellationCard = ({ referral }: IProps_Referral) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReferralCancelledData referral={referral} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

////////////////

export const ReferralNotAttendedCard = ({ referral }: IProps_Referral) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReferralNotAttendedData referral={referral} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

////////////////

export const ReferralAssessedCard = ({ referral }: IProps_Referral) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReferralAssessedData referral={referral} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
