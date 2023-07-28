import React from 'react';
import Alert from '@mui/material/Alert';

export type AlertStatus = 'clear' | 'warning' | 'danger';

export type AlertMessageProps = {
  status: AlertStatus;
  open: boolean;
  handleClose: () => void;
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  status,
  open,
  handleClose,
}) => {
  if (!open || status === 'clear') {
    return null;
  }
  switch (status) {
    case 'danger':
      return (
        <Alert severity="error" onClose={handleClose}>
          {"You secret key is expired. SMS messages to the server won't work"}
        </Alert>
      );
    case 'warning':
      return (
        <Alert severity="warning" onClose={handleClose}>
          {
            "Before , you need to sync this app on this phone to the Cradle server over a data connection so the app can update its SMS security information. Until you will be able to use SMS messages to connect as normal. After that date, SMS messages to the server won't work until you sync over a data connection."
          }
        </Alert>
      );
    default:
      return null;
  }
};
