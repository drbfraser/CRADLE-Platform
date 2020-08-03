import DialogContentText from '@material-ui/core/DialogContentText';
import { DialogPopup } from '../../components/dialogPopup';
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
    <DialogPopup
      open={show && message !== null}
      onClose={handleNegativeClick}
      aria-labelledby="search-prompt-dialog-title"
      content={<DialogContentText>{message}</DialogContentText>}
      title="Add Patient"
      primaryAction={{
        buttonText: adding ? `Adding...` : positiveText,
        classes: { root: classes.button },
        disabled: adding,
        onClick: handlePositiveClick,
      }}
      secondaryAction={{
        buttonText: `Cancel`,
        classes: { root: classes.button },
        disabled: adding,
        onClick: handleNegativeClick,
      }}
    />
  );
};
