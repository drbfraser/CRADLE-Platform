import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';
import { ReferralForm } from './ReferralForm';
import { goBackWithFallback } from 'src/shared/utils';

type RouteParams = {
  patientId: string;
};

export const ReferralFormPage = () => {
  const classes = useStyles();
  const { patientId } = useRouteMatch<RouteParams>().params;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')} size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Referral</Typography>
      </div>
      <br />
      <ReferralForm patientId={patientId} />
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
});
