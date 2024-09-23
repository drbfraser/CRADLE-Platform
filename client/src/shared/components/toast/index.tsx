import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

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
  return (
    <Snackbar
      autoHideDuration={autoHideDuration}
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transitionDuration={transitionDuration}
      sx={(theme) => ({
        root: {
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        },
      })}
      onClose={onClose}>
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};
