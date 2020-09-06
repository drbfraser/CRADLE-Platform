import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { useStyles } from './styles';

interface IProps {
  show: boolean;
  onClose: () => void;
}

export const AlreadyAdded: React.FC<IProps> = ({ show, onClose }) => {
  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{ vertical: `top`, horizontal: `center` }}
      classes={{ ...classes }}
      open={show}
      autoHideDuration={2000}
      onClose={onClose}>
      <SnackbarContent message="This patient has already been added!" />
    </Snackbar>
  );
};
