import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../../../shared/components/dialogPopup';
import React from 'react';

interface IProps {
  open: boolean;
  handleDialogClose: any;
}

export default function AlertDialog(props: IProps) {
  return (
    <DialogPopup
      open={props.open}
      onClose={props.handleDialogClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      content={
        <DialogContentText id="alert-dialog-description">
          This pop will will be used to inform the user if they are using a
          duplicated ID
        </DialogContentText>
      }
      title="The Id is Valid"
      primaryAction={{
        buttonText: `Ok!`,
        onClick: props.handleDialogClose,
      }}
    />
  );
}
