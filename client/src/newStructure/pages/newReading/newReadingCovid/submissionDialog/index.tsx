import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface IProps {
  open: boolean;
  patientExist: boolean;
  readingCreated: boolean;
  handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        {props.readingCreated ?
            <DialogTitle id="alert-dialog-title">{'Submitted!!'}</DialogTitle>
            :
            <DialogTitle id="alert-dialog-title">{'FAILED'}</DialogTitle>
        }
        <DialogContent>
          {props.readingCreated ?
              <DialogContentText id="alert-dialog-description">
                {props.patientExist
                    ? `Reading Created Successfully!`
                    : `Patient and Reading Created Successfully!`}
              </DialogContentText>
          :
              <DialogContentText id="alert-dialog-description">
                Error! Patient reading not created.
              </DialogContentText>
          }
        </DialogContent>
        <DialogActions>
          {props.readingCreated ?
          <Button                 value={'ok'}
                                  onClick={props.handleDialogClose} color="primary">
            Ok!
          </Button>
:
          <Button                 value={'redo'}
                                  onClick={props.handleDialogClose} color="primary">
            Take Reading Again
          </Button>
          }
        </DialogActions>
      </Dialog>
    </div>
  );
}
