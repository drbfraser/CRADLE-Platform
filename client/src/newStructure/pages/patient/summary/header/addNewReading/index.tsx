import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  openReadingModal: () => void;
}

export const AddNewReading: React.FC<IProps> = ({ openReadingModal }) => {
  const classes = useStyles();

  return (
    <Button
      className={classes.button}
      startIcon={<AddIcon />}
      variant="contained"
      onClick={openReadingModal}>
      <Typography variant="body2">Add New Reading</Typography>
    </Button>
  );
};
