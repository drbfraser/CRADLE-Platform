import React, { useEffect } from 'react';

import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core';

interface IProps {
  severity: React.ComponentProps<typeof Alert>['severity'];
  message: string | JSX.Element;
  open: boolean;
  onClose: () => void;
  transitionDuration?: number;
  autoHide?: boolean;
  autoHideDuration?: number;
}

export const Toast: React.FC<IProps> = ({
  severity,
  message,
  open,
  onClose,
  transitionDuration = 500,
  autoHide = true,
  autoHideDuration = 5000,
}) => {
  const classes = useStyles();

  useEffect(() => {
    if (!autoHide || !open) {
      return;
    }

    const timer = setTimeout(onClose, autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, onClose, autoHideDuration, autoHide]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transitionDuration={transitionDuration}
      className={classes.root}
      draggable={true}>
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
