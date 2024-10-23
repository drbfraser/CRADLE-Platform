import { AssessmentState, getAssessmentState } from './state';
import { useEffect, useState } from 'react';

import { AssessmentForm } from './AssessmentForm';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate, useRouteMatch } from 'react-router-dom';
import { Box } from '@mui/material';

type RouteParams = {
  patientId: string;
  assessmentId: string | undefined;
  referralId: string | undefined;
};

export const AssessmentFormPage = () => {
  const { patientId, assessmentId, referralId } =
    useRouteMatch<RouteParams>().params;
  const [formInitialState, setFormInitialState] = useState<AssessmentState>();

  useEffect(() => {
    getAssessmentState(patientId, assessmentId).then(setFormInitialState);
  }, [patientId, assessmentId]);

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        maxWidth: 1250,
        margin: '0 auto',
      }}>
      <Box
        sx={{
          display: `flex`,
          alignItems: `center`,
        }}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => navigate(`/patients/${patientId}`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">
          {`${assessmentId !== undefined ? 'Update' : 'New'} Assessment`}
        </Typography>
      </Box>
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
    </Box>
  );
};
