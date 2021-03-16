import { OrNull, OrUndefined } from 'src/types';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';

import Alert from '@material-ui/lab/Alert';
import React from 'react';

type Severity = `error` | `success` | `info` | `warning`;

interface IProps {
  message: OrNull<string>;
  clearMessage: () => void;
  status: Severity;
  clickaway?: boolean;
}

export const Toast: React.FC<IProps> = ({
  message,
  clearMessage,
  status,
  clickaway = false,
}) => {
  const [toastMessage, setToastMessage] = React.useState<OrNull<string>>(null);
  const [severity, setSeverity] = React.useState<OrUndefined<Severity>>(status);

  React.useEffect((): (() => void) => {
    let timeout: OrUndefined<NodeJS.Timeout>;

    if (message) {
      // * Only update the snackbar color if the message changes
      if (message !== toastMessage) {
        setSeverity(status);
      }
      setToastMessage(message);
    } else {
      // * Prevents the snackbar message from immediately
      // * disappearing when the message is cleared
      timeout = setTimeout(() => {
        setSeverity(undefined);
        setToastMessage(null);
      }, 150);
    }

    return (): void => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [message, status, toastMessage]);

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
      <Alert severity={severity} variant="filled" onClose={handleClose}>
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};
