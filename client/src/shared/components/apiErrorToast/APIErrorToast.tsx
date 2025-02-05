import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  Typography,
} from '@mui/material';

import { CancelButton } from '../Button';
import { Toast } from '../toast';

interface IProps {
  open: boolean;
  onClose: () => void;
  errorMessage?: string;
}

const APIErrorToast = ({ open, onClose, errorMessage }: IProps) => {
  // state to allow toast to close itself without needing to rely on parent state via `props.open`
  const [toastOpen, setToastOpen] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  const Message = () =>
    errorMessage ? (
      <>{errorMessage}</>
    ) : (
      <>
        Something went wrong - please try that again. Still having problems? Try
        some{' '}
        <Link
          onClick={() => {
            onClose();
            setDialogOpen(true);
          }}
          sx={{
            '&, &:hover': {
              color: 'white',
              textDecoration: 'underline',
              cursor: 'pointer',
            },
          }}
          underline="hover">
          troubleshooting steps
        </Link>
        .
      </>
    );

  const TroubleshootDialog = () => (
    <Dialog open={dialogOpen}>
      <DialogTitle
        sx={{
          paddingBottom: 0,
        }}>
        Troubleshooting Steps
      </DialogTitle>
      <DialogContent>
        <Typography component="div">
          <List
            component="ol"
            sx={{
              '& li': {
                marginBottom: '15px',
              },
            }}>
            <li>
              CRADLE Web requires an internet connection. Please verify you are
              connected to the internet by visiting a popular website. For
              example, try searching something on Google. If your internet
              connection is not working at the moment, try using CRADLE Web
              later or use the Android application.
            </li>
            <li>
              Verify that you are able to access CRADLE Web in a different tab
              or from a different device. If you cannot, CRADLE Web might be
              down at the moment. We&apos;re working to fix this as soon as
              possible!
            </li>
            <li>
              If you have a connection to the internet and are able to access
              CRADLE Web from another device, refresh CRADLE Web and try to
              perform the same action again.
            </li>
            <li>
              If you&apos;re filling out a form, ensure that all data in the
              form is valid prior to submitting.
            </li>
            <li>
              Still not working? Contact the person or organization who manages
              your CRADLE Web installation, give them a detailed description of
              what you tried to do (with screenshots, if possible) and ask that
              they forward it to CRADLE Web&apos;s development team. Sorry you
              encountered an issue - we&apos;ll do our best to fix it!
            </li>
          </List>
        </Typography>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={() => setDialogOpen(false)}>Close</CancelButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Toast
        severity="error"
        open={toastOpen && open}
        onClose={() => {
          setToastOpen(false);
          onClose();
        }}
        message={<Message />}
      />
      <TroubleshootDialog />
    </>
  );
};

export default APIErrorToast;
