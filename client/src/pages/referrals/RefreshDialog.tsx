import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';

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
    onClose();
  };

  const handleSecChange = (e: any) => {
    timer_sec = e.target.value;
  };

  const handleMinChange = (e: any) => {
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
          className={classes.alignCenter}
          id="min-input"
          defaultValue={timer_min}
          onChange={handleMinChange}
          type="number"
        />
        <p className={classes.inlineBlock}>minutes and </p>
        <TextField
          className={classes.alignCenter}
          id="sec-input"
          defaultValue={timer_sec}
          onChange={handleSecChange}
          type="number"
        />
        <p className={classes.inlineBlock}>seconds.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onStop} color="primary">
          Stop Auto-Refresh
        </Button>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary">
          Confirm
        </Button>
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
