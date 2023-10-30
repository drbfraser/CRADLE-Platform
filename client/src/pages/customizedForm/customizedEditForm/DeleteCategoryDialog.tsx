import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  open: boolean;
  onClose: (confirm: boolean) => void;
  numQuestions: number;
}

const DeleteCategoryDialog = ({ open, onClose, numQuestions }: IProps) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Category</DialogTitle>
      <DialogContent>
        <p>
          Are you sure you want to delete this category and its {numQuestions}
          &nbsp;question{numQuestions > 1 && 's'}?
        </p>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <CancelButton onClick={() => onClose(false)}>Cancel</CancelButton>
        <PrimaryButton onClick={() => onClose(true)}>Delete</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryDialog;

const useStyles = makeStyles((theme) => ({
  actions: {
    padding: theme.spacing(2),
  },
}));
