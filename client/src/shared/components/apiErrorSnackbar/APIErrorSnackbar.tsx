import React, { useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  makeStyles,
  Snackbar,
  Typography,
} from '@material-ui/core';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const APIErrorSnackbar = ({ open, onClose }: IProps) => {
  const styles = useStyles();
  const [dialogOpen, setDialogOpen] = useState(true);

  const TroubleshootDialog = () => (
    <Dialog open={dialogOpen}>
      <DialogTitle>Troubleshooting Steps</DialogTitle>
      <DialogContent>
        <Typography component="div">
          <ol>
            <li>
              The CRADLE website requires an internet connection. Please verify
              you are connected to the internet by visiting a popular website.
              For example, try searching something on Google. If your internet
              connection is not working at the moment, try using CRADLE later or
              use the Android application.
            </li>
            <li>
              Verify that you are able to access CRADLE in a different tab or
              from a different device. If you cannot, CRADLE might be down at
              the moment. We&apos;re working to fix this as soon as possible!
            </li>
            <li>
              If you have a connection to the internet and are able to access
              CRADLE in a new tab, refresh CRADLE and try to perform the same
              action again.
            </li>
            <li>
              Still not working? Contact the person or organization who manages
              your CRADLE instance, give them a detailed description of what you
              tried to do (with screenshots, if possible) and ask that they
              forward it to CRADLE&apos;s development team. Sorry you
              encountered an issue - we&apos;ll do our best to fix it!
            </li>
          </ol>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}>
        <Alert severity="error" variant="filled" onClose={onClose}>
          Something went wrong - please try that again. Still having problems?
          Try some{' '}
          <Link
            onClick={() => setDialogOpen(true)}
            className={styles.alertLink}>
            troubleshooting steps
          </Link>
          .
        </Alert>
      </Snackbar>
      <TroubleshootDialog />
    </>
  );
};

const useStyles = makeStyles({
  alertLink: {
    '&, &:hover': {
      color: 'white',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
});

export default APIErrorSnackbar;
