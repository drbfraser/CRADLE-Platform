import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';

import Alert from '@material-ui/lab/Alert';
import { OrNull } from '@types';
import React from 'react';

interface IProps {
  error: OrNull<string>;
  clearError: () => void;
}

export const Error: React.FC<IProps> = ({ error, clearError }) => {
  const handleClose = (
    _: React.SyntheticEvent,
    reason?: SnackbarCloseReason
  ): void => {
    if (reason === `clickaway`) {
      return;
    }

    clearError();
  };

  return (
    <Snackbar
      open={Boolean(error)}
      anchorOrigin={{ vertical: `top`, horizontal: `center` }}
      onClose={handleClose}>
      <Alert severity="error" variant="filled" onClose={handleClose}>
        {error}
      </Alert>
    </Snackbar>
  );
};
