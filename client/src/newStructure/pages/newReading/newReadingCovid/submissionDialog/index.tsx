import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../../../shared/components/dialogPopup';
import React from 'react';

interface IProps {
  open: boolean;
  patientExist: boolean;
  readingCreated: boolean;
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
        <>
          {props.readingCreated ? (
            <DialogContentText id="alert-dialog-description">
              {props.patientExist
                ? `Reading Created Successfully!`
                : `Patient and Reading Created Successfully!`}
            </DialogContentText>
          ) : (
            <DialogContentText id="alert-dialog-description">
              Error! Patient reading not created.
            </DialogContentText>
          )}
        </>
      }
      title={props.readingCreated ? `Submitted` : `FAILED`}
      primaryAction={{
        children: props.readingCreated ? `Ok!` : `Take Reading Again`,
        value: props.readingCreated ? `ok` : `redo`,
        onClick: props.handleDialogClose,
      }}
    />
  );
}
