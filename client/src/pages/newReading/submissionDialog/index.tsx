import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../../shared/components/dialogPopup';
import { OrNull } from '@types';
import React from 'react';

interface IProps {
  open: boolean;
  error: OrNull<string>;
  success: OrNull<string>;
  patientExist: boolean;
  readingCreated: boolean;
  handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
  const message = React.useMemo((): OrNull<string> => {
    return props.error || props.success;
  }, [props.error, props.success]);

  return (
    <DialogPopup
      open={props.open}
      onClose={props.handleDialogClose}
      aria-labelledby="submit-dialog-title"
      aria-describedby="submit-dialog-description"
      content={
        <>
          {message || props.readingCreated ? (
            <DialogContentText id="alert-dialog-description">
              {message
                ? message
                : props.patientExist
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
      title={props.readingCreated || props.success ? `Submitted` : `FAILED`}
      primaryAction={{
        children:
          props.readingCreated || message ? `Ok!` : `Take Reading Again`,
        value: props.readingCreated || message ? `ok` : `redo`,
        onClick: props.handleDialogClose,
      }}
    />
  );
}
