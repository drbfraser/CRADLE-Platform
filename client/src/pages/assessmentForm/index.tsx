import { AssessmentState, getAssessmentState } from './state';
import React, { useEffect, useState } from 'react';

import { AssessmentForm } from './AssessmentForm';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { goBackWithFallback } from 'src/shared/utils';
import { makeStyles } from '@material-ui/core/styles';
import { useRouteMatch } from 'react-router-dom';

type RouteParams = {
  patientId: string;
  assessmentId: string | undefined;
  referralId: string | undefined;
};

export const AssessmentFormPage = () => {
  const classes = useStyles();
  const { patientId, assessmentId, referralId } =
    useRouteMatch<RouteParams>().params;
  const [formInitialState, setFormInitialState] = useState<AssessmentState>();

  useEffect(() => {
    getAssessmentState(patientId, assessmentId).then(setFormInitialState);
  }, [patientId, assessmentId]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={() => goBackWithFallback('/patients')}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          {`${assessmentId !== undefined ? 'Update' : 'New'} Assessment`}
        </Typography>
      </div>
      <br />
      {formInitialState === undefined ? (
        <LinearProgress />
      ) : (
        <AssessmentForm
          initialState={formInitialState}
          patientId={patientId}
          assessmentId={assessmentId}
          referralId={referralId}
        />
      )}
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
