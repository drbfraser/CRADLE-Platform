import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

interface IProps {
  severity: React.ComponentProps<typeof Alert>['severity'];
  message: string | JSX.Element;
  open: boolean;
  onClose: () => void;
  transitionDuration?: number;
}

export const Toast: React.FC<IProps> = ({
  severity,
  message,
  open,
  onClose,
  transitionDuration,
}) => (
  <Snackbar
    open={open}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    transitionDuration={transitionDuration}>
    <Alert severity={severity} variant="filled" onClose={onClose}>
      {message}
    </Alert>
  </Snackbar>
);
