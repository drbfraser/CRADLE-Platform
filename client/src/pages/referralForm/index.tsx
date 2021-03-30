import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { ReferralForm } from './ReferralForm';
import { goBackWithFallback } from 'src/shared/utils';

type RouteParams = {
  readingId: string;
};

export const ReferralFormPage = () => {
  const classes = useStyles();
  const { readingId } = useRouteMatch<RouteParams>().params;

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Referral</Typography>
      </div>
      <br />
      <ReferralForm readingId={readingId} />
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
