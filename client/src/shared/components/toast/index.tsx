import Alert from '@material-ui/lab/Alert';
import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core';

interface IProps {
  severity: React.ComponentProps<typeof Alert>['severity'];
  message: string | JSX.Element;
  open: boolean;
  onClose: () => void;
  transitionDuration?: number;
  autoHideDuration?: number;
}

export const Toast: React.FC<IProps> = ({
  severity,
  message,
  open,
  onClose,
  transitionDuration = 500,
  autoHideDuration = 5000,
}) => {
  const classes = useStyles();

  return (
    <Snackbar
      autoHideDuration={autoHideDuration}
      key={message}
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
