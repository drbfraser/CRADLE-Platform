import { OrNull, OrUndefined } from '@types';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';

import Alert from '@material-ui/lab/Alert';
import React from 'react';

interface IProps {
  error: OrNull<string>;
  clearError: () => void;
}

export const Error: React.FC<IProps> = ({ error, clearError }) => {
  const [message, setMessage] = React.useState<OrNull<string>>(null);

  React.useEffect((): (() => void) => {
    let timeout: OrUndefined<NodeJS.Timeout>;

    if (error) {
      setMessage(error);
    } else {
      // * Prevents the snackbar message from immediately
      // * disappearing when the error is cleared
      timeout = setTimeout(() => {
        setMessage(null);
      }, 150);
    }

    return (): void => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [error]);

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
        {message}
      </Alert>
    </Snackbar>
  );
};
