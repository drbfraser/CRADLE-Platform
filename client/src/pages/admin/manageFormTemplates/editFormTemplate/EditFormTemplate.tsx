import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { goBackWithFallback } from '../../../../shared/utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Typography from '@mui/material/Typography';
import APIErrorToast from '../../../../shared/components/apiErrorToast/APIErrorToast';
import { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';

export const EditFormPage = () => {
  const [submitError, setSubmitError] = useState(false);
  const useStyles = makeStyles({
    container: {
      maxWidth: 1250,
      margin: '0 auto',
    },
    title: {
      display: `flex`,
      alignItems: `center`,
    },
    right: {
      float: 'right',
      margin: 5,
    },
  });
  const classes = useStyles();
  // const [errorMessage, setErrorMessage] = useState<string>('');
  return (
    <>
      <APIErrorToast
        open={submitError}
        onClose={() => setSubmitError(false)}
        // errorMessage={errorMessage}
      />
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton
            onClick={() => goBackWithFallback(`/admin/form-templates`)}
            size="large">
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">{'Create New Template'}</Typography>
      </div>

      <Paper>
        <Box p={2}>Hello</Box>
      </Paper>
    </>
  );
};
