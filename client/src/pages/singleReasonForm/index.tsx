import React, { useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import { SingleReasonForm } from './SingleReasonForm';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { goBackWithFallback } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';
import { useRouteMatch } from 'react-router-dom';

type RouteParams = {
  referralId: string;
  type: string;
};

export const SingleReasonFormPage = () => {
  const classes = useStyles();
  const { referralId } = useRouteMatch<RouteParams>().params;
  const { type } = useRouteMatch<RouteParams>().params;
  const [title, setTitle] = useState('');

  React.useEffect(() => {
    switch (type) {
      case 'cancel_referral':
        setTitle('Reason for Cancelling');
        break;
      case 'not_attend_referral':
        setTitle('Reason for Undo Cancelling');
        break;
      case 'undo_cancel_referral':
        setTitle('Reason for Not Attend');
        break;
      default:
        setTitle('');
        break;
    }
  }, [type]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')} size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{title}</Typography>
      </div>
      <br />
      <SingleReasonForm referralId={referralId} type={type} />
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
