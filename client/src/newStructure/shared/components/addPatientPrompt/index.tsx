import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  show: boolean;
  message: string;
  positiveText: string;
  closeDialog: () => void;
  addPatient: () => void;
}

export const AddPatientPrompt: React.FC<IProps> = ({
  show,
  message,
  positiveText,
  closeDialog,
  addPatient,
}) => {
  const classes = useStyles();

  const handleNegativeClick = (event: React.MouseEvent): void => {
    // Prevents clicking on the parent patient row
    // which would cause navigation to the patient page
    event.stopPropagation();

    closeDialog();
  };

  const handlePositiveClick = (event: React.MouseEvent): void => {
    // Prevents clicking on the parent patient row
    // which would cause navigation to the patient page
    event.stopPropagation();

    addPatient();
    closeDialog();
  };

  return (
    <Dialog
      open={show}
      onClose={handleNegativeClick}
      aria-labelledby="search-prompt-dialog-title">
      <DialogTitle id="search-prompt-dialog-title">Add Patient</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          classes={{ root: classes.button }}
          onClick={handleNegativeClick}
          color="primary">
          Cancel
        </Button>
        <Button
          classes={{ root: classes.button }}
          onClick={handlePositiveClick}
          color="primary">
          {positiveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
