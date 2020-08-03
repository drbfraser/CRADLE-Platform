import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import { useStyles } from '../styles';

interface IProps {
  open: boolean;
  handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
  const classes = useStyles();

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{'Submitted!!'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Patient and Reading Created Successfully
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button
            onClick={props.handleDialogClose}
            color="primary"
            variant="outlined">
            Ok!
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
