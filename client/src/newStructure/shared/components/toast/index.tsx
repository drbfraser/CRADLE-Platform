import { OrNull, OrUndefined } from '@types';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';

import Alert from '@material-ui/lab/Alert';
import React from 'react';

interface IProps {
  message: OrNull<string>;
  clearMessage: () => void;
  status: `error` | `success` | `info` | `warning`;
  clickaway?: boolean;
}

export const Toast: React.FC<IProps> = ({
  message,
  clearMessage,
  status,
  clickaway = false,
}) => {
  const [toastMessage, setToastMessage] = React.useState<OrNull<string>>(null);

  React.useEffect((): (() => void) => {
    let timeout: OrUndefined<NodeJS.Timeout>;

    if (message) {
      setToastMessage(message);
    } else {
      // * Prevents the snackbar message from immediately
      // * disappearing when the message is cleared
      timeout = setTimeout(() => {
        setToastMessage(null);
      }, 150);
    }

    return (): void => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [message]);

  const handleClose = (
    _: React.SyntheticEvent,
    reason?: SnackbarCloseReason
  ): void => {
    if (!clickaway && reason === `clickaway`) {
      return;
    }

    clearMessage();
  };

  return (
    <Snackbar
      open={Boolean(message)}
      anchorOrigin={{ vertical: `top`, horizontal: `center` }}
      onClose={handleClose}>
      <Alert severity={status} variant="filled" onClose={handleClose}>
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};
