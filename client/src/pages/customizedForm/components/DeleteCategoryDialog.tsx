import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import { useEffect, useState } from 'react';

interface IProps {
  open: boolean;
  onClose: (confirm: boolean) => void;
  numQuestionsProp: number;
}

const DeleteCategoryDialog = ({ open, onClose, numQuestionsProp }: IProps) => {
  const [numQuestions, setNumQuestions] = useState(0);
  useEffect(() => {
    setNumQuestions(numQuestionsProp);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Category</DialogTitle>
      <DialogContent>
        <p>
          Are you sure you want to delete this category and its {numQuestions}
          &nbsp;question{numQuestions !== 1 && 's'}?
        </p>
      </DialogContent>
      <DialogActions
        sx={(theme) => ({
          actions: {
            padding: theme.spacing(2),
          },
        })}>
        <CancelButton onClick={() => onClose(false)}>Cancel</CancelButton>
        <PrimaryButton onClick={() => onClose(true)}>Delete</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryDialog;
