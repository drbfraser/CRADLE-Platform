import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../../../shared/components/dialogPopup';
import React from 'react';

interface IProps {
  open: boolean;
  handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
  return (
    <DialogPopup
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
        children: `Ok!`,
        onClick: props.handleDialogClose,
      }}
    />
  );
}
