import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSecretKey } from 'src/shared/hooks/secretKey';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import makeStyles from '@mui/styles/makeStyles';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/shared/types';
import { SecretKeyState } from 'src/redux/reducers/secretKey';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SecretKeyPage: React.FC = () => {
  const classes = useStyles();
  const [showPassword, setShowPassWord] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const currentUserData = useSelector(
    ({
      user,
    }: ReduxState): OrNull<Pick<IUserWithTokens, 'role' | 'userId'>> => {
      const currentUser = user.current.data;
      if (currentUser == null) {
        return null;
      }
      return { userId: currentUser.userId, role: currentUser.role };
    }
  );
  const secretKey = useSelector(({ secretKey }: ReduxState): SecretKeyState => {
    return secretKey;
  });
  const {
    role,
    currentSecretKey,
    setFocusUserId,
    getUserSecretKeyHandler,
    updateSecretKeyHandler,
  } = useSecretKey(secretKey, currentUserData);

  return (
    <>
      <Paper className={classes.wrapper}>
        <div className={classes.topWrapper}>
          <div className={classes.title}>
            <h2 className={classes.title}>SMS secret key detail</h2>
          </div>
        </div>
        <div className={classes.mainWrapper}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Your SMS Key Details
              </Typography>
              <div>
                <PasswordViewer
                  focused={false}
                  label="Key"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={currentSecretKey?.sms_key}
                  variant="filled"
                  aria-readonly
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassWord((prev) => !prev)}
                          edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className={classes.section}>
                <Typography color="text.secondary" gutterBottom>
                  Stale Day
                </Typography>
                <Typography>
                  {currentSecretKey
                    ? currentSecretKey.stale_date
                    : 'No stale date available'}
                </Typography>
              </div>
              <div className={classes.section}>
                <Typography color="text.secondary" gutterBottom>
                  Stale Day
                </Typography>
                <Typography>
                  {currentSecretKey
                    ? currentSecretKey.stale_date
                    : 'No stale date available'}
                </Typography>
              </div>
            </CardContent>
            <CardActions>
              <Button size="medium" onClick={() => setShowModal(true)}>
                Learn More
              </Button>
            </CardActions>
          </Card>
        </div>
      </Paper>
      <Dialog
        fullWidth
        open={showModal}
        maxWidth={'md'}
        onClose={() => setShowModal(false)}
        aria-describedby="SMSrelay-secret-key-detail">
        <DialogTitle>{'What is the SMS secret key?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="SMSrelay-secret-key-detail">
            hihihihihihihihihihi
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Close</Button>
          <Button onClick={updateSecretKeyHandler}>Update key</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const useStyles = makeStyles({
  wrapper: {
    backgroundColor: '#fff',
  },
  topWrapper: {
    padding: 15,
  },
  title: {
    display: 'inline-block',
  },
  mainWrapper: {
    padding: 15,
  },
  section: {
    marginTop: 30,
  },
});

const PasswordViewer = styled(TextField)({
  '& .MuiInputLabel-root': {
    display: 'none',
  },
});

export default SecretKeyPage;
