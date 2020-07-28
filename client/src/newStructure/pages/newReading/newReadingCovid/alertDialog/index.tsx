import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ButtonGroup } from '@material-ui/core';

interface IProps {
  open: boolean;
  handleDialogClose: any;
  patientExist: boolean;
  patient: any;
}

export default function AlertDialog(props: IProps) {
  return (
    <div>
      <Dialog
        open={props.open}
        onClose={props.handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          {props.patientExist
            ? 'Patient ID already exists'
            : 'Patient ID does not exist'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {props.patientExist
              ? 'Would you like to use the patient with '
              : 'Click OK! to make reading'}
            {props.patientExist ? (
              <div>
                {'ID: '}
                {props.patient.patientId}{' '}
              </div>
            ) : (
              ''
            )}
            {props.patientExist ? (
              <div>
                {'Initials: '}
                {props.patient.patientName}{' '}
              </div>
            ) : (
              ''
            )}
            {props.patientExist ? (
              <div>
                {'Patient Sex: '}
                {props.patient.patientSex}
              </div>
            ) : (
              ''
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {props.patientExist ? (
            <ButtonGroup>
              <Button
                value={'no'}
                onClick={props.handleDialogClose}
                color="primary">
                No
              </Button>
              <Button
                value={'yes'}
                onClick={props.handleDialogClose}
                color="primary">
                Yes
              </Button>
            </ButtonGroup>
          ) : (
            <Button
              value={'ok'}
              onClick={props.handleDialogClose}
              color="primary">
              Ok!
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
