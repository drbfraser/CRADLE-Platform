import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { SingleReasonForm } from './SingleReasonForm';
import { goBackWithFallback } from 'src/shared/utils';

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
    if (type === 'cancel_referral') {
      setTitle('Reason for Cancelling');
    } else if (type === 'undo_cancel_referral') {
      setTitle('Reason for Undo Cancelling');
    } else if (type === 'not_attend_referral') {
      setTitle('Reason for Not Attend');
    } else {
      //illegal card. no handling
    }
  }, [type]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')}>
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
