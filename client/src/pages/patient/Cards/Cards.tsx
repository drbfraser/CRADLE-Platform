import { Box, Grid, Paper } from '@mui/material';
import { CustomizedForm, FollowUp, Reading, Referral } from 'src/shared/types';

import { AssessmentData } from './AssessmentData';
import { CustomizedFormData } from './CustomizedFormData';
import { ReadingData } from './ReadingData';
import { ReferralAssessedData } from './ReferralAssessedData';
import { ReferralCancelledData } from './ReferralCancelledData';
import { ReferralNotAttendedData } from './ReferralNotAttendedData';
import { ReferralPendingData } from './ReferralPendingData';

interface IProps_Reading {
  reading: Reading;
}

interface IProps_Referral {
  referral: Referral;
}

interface IProps_Assessment {
  followUp: FollowUp;
}

interface IProps_CustomizedForm {
  form: CustomizedForm;
}

export const ReadingCard = ({ reading }: IProps_Reading) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <ReadingData reading={reading} />
          </Grid>
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

export const CustomizedFormCard = ({ form }: IProps_CustomizedForm) => {
  return (
    <Paper>
      <Box p={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <CustomizedFormData form={form} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
