import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { OrNull } from '@types';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  show: boolean;
  message: OrNull<string>;
  positiveText: string;
  closeDialog: () => void;
  addPatient: OrNull<() => void>;
  adding?: boolean;
}

export const AddPatientPrompt: React.FC<IProps> = ({
  show,
  message,
  positiveText,
  closeDialog,
  addPatient,
  adding,
}) => {
  const classes = useStyles();

  const handleNegativeClick = (event: React.MouseEvent): void => {
    // * Prevents clicking on the parent patient row
    // * which would cause navigation to the patient page
    event.stopPropagation();

    closeDialog();
  };

  const handlePositiveClick = (event: React.MouseEvent): void => {
    // * Prevents clicking on the parent patient row
    // * which would cause navigation to the patient page
    event.stopPropagation();

    addPatient?.();
  };

  return (
    <Dialog
      open={show && message !== null}
      onClose={handleNegativeClick}
      aria-labelledby="search-prompt-dialog-title">
      <DialogTitle id="search-prompt-dialog-title">Add Patient</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          classes={{ root: classes.button }}
          disabled={adding}
          onClick={handleNegativeClick}
          color="primary">
          Cancel
        </Button>
        <Button
          classes={{ root: classes.button }}
          disabled={adding}
          onClick={handlePositiveClick}
          color="primary">
          {adding ? `Adding...` : positiveText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
