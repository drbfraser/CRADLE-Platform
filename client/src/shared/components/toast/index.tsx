import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  severity: React.ComponentProps<typeof Alert>['severity'];
  message: string | JSX.Element;
  open: boolean;
  onClose: () => void;
  transitionDuration?: number;
  autoHideDuration?: number;
}

export const Toast: React.FC<IProps> = ({
  severity,
  message,
  open,
  onClose,
  transitionDuration = 500,
  autoHideDuration = 5000,
}) => {
  const classes = useStyles();

  return (
    <Snackbar
      autoHideDuration={autoHideDuration}
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transitionDuration={transitionDuration}
      className={classes.root}
      onClose={onClose}>
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
