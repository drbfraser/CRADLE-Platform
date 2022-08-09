import React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import { CancelButton, SecondaryButton } from 'src/shared/components/Button';

interface IProps {
  open: boolean;
  isTransformed: boolean;
  onClose: () => void;
  setRefreshTimer: React.Dispatch<React.SetStateAction<number>>;
  refreshTimer: number;
}

export const RefreshDialog = ({
  open,
  isTransformed,
  onClose,
  setRefreshTimer,
  refreshTimer,
}: IProps) => {
  const classes = useStyles();
  let timer_min = 0;
  let timer_sec: number = refreshTimer;
  timer_min = Math.floor(timer_sec / 60);
  timer_sec = timer_sec % 60;

  const onStop = () => {
    setRefreshTimer(() => {
      return 0;
    });
    onClose();
  };

  const onConfirm = () => {
    const timeInSec: number = +timer_sec + timer_min * 60;
    setRefreshTimer(timeInSec);
    localStorage.setItem('refreshInterval', String(timeInSec));
    onClose();
  };

  const handleSecChange = (e: any) => {
    if (e.target.value < 0) {
      e.target.value = 0;
    }
    timer_sec = e.target.value;
  };

  const handleMinChange = (e: any) => {
    if (e.target.value < 0) {
      e.target.value = 0;
    }
    timer_min = e.target.value;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="Auto-Refresh-setting-dialog"
      maxWidth={isTransformed ? 'md' : 'sm'}>
      <DialogTitle id="form-dialog-title">Auto-Refresh Settings</DialogTitle>
      <DialogContent>
        <p className={classes.inlineBlock}>Auto refresh every </p>
        <TextField
          variant="standard"
          className={classes.alignCenter}
          id="min-input"
          defaultValue={timer_min}
          onChange={handleMinChange}
          type="number" />
        <p className={classes.inlineBlock}>minutes and </p>
        <TextField
          variant="standard"
          className={classes.alignCenter}
          id="sec-input"
          defaultValue={timer_sec}
          onChange={handleSecChange}
          type="number" />
        <p className={classes.inlineBlock}>seconds.</p>
      </DialogContent>
      <DialogActions>
        <SecondaryButton onClick={onStop} color="primary">
          Stop Auto-Refresh
        </SecondaryButton>
        <CancelButton onClick={onClose} color="primary">
          Cancel
        </CancelButton>
        <SecondaryButton onClick={onConfirm} color="primary">
          Confirm
        </SecondaryButton>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles((theme) => ({
  inlineBlock: {
    display: 'inline-block',
  },
  alignCenter: {
    maxWidth: '6em',
    verticalAlign: 'middle',
    margin: 'auto 8px',
  },
}));
