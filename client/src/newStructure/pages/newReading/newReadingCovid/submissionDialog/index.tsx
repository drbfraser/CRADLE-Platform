import { Dialog } from '../../../../shared/components/dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import React from 'react';

interface IProps {
  open: boolean;
  handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleDialogClose}
      aria-labelledby="submit-dialog-title"
      aria-describedby="submit-dialog-description"
      content={
        <DialogContentText id="submit-dialog-description">
          Patient and Reading Created Successfully
        </DialogContentText>
      }
      title="Submitted!!"
      primaryAction={{
        buttonText: `Ok!`,
        onClick: props.handleDialogClose,
      }}
    />
  );
}
