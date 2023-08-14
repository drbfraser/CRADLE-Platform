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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { ReduxState } from 'src/redux/reducers';
import { IUserWithTokens, OrNull } from 'src/shared/types';
import { SecretKeyState } from 'src/redux/reducers/secretKey';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { UserRoleEnum } from 'src/shared/enums';

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

  const handleUserSelect = (event: SelectChangeEvent<string>) => {
    const currId = event.target.value;
    if (typeof currId === 'number') {
      setFocusUserId(currId);
    }
  };

  const {
    users,
    role,
    currentSecretKey,
    focusUserId,
    setFocusUserId,
    updateSecretKeyHandler,
  } = useSecretKey(secretKey, currentUserData, setShowModal);
  return (
    <>
      <Paper className={classes.wrapper}>
        <div className={classes.topWrapper}>
          <div className={classes.title}>
            <h2 className={classes.title}>SMS secret key detail</h2>
          </div>
          {role === UserRoleEnum.ADMIN && users.length > 1 && focusUserId && (
            <FormControl className={classes.selector}>
              <Select
                id="focus-users"
                value={focusUserId + ''}
                onChange={handleUserSelect}>
                {users.map((u, index) => (
                  <MenuItem key={index} value={u.userId}>
                    {u.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <div className={classes.mainWrapper}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Your SMS Key Details
              </Typography>
              {role === UserRoleEnum.ADMIN && (
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
              )}
              <div className={classes.section}>
                <Typography color="text.secondary" gutterBottom>
                  Expiry date
                </Typography>
                <Typography>
                  {currentSecretKey
                    ? currentSecretKey.expiry_date.toString().split(' ')[0]
                    : 'No stale date available'}
                </Typography>
              </div>
              <div className={classes.section}>
                <Typography color="text.secondary" gutterBottom>
                  Stale Day
                </Typography>
                <Typography>
                  {currentSecretKey
                    ? currentSecretKey.stale_date.toString().split(' ')[0]
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
            Think of an SMS secret key like a special pass that lets your mobile
            device do a bunch of things using text messages.This key has two
            important dates: <br />
            <br />
            The Stale-date and the Expiry-date. The Stale-date is like a
            freshness indicator. After this date, the key gets automatically
            refreshed by the server, like making it new again The Expiry-date is
            like a deadline. After this date, theserver will not let your mobile
            device send any more messages.
            <br />
            <br />
            <br />
            If your key is getting close to these dates, it is a good idea to
            update it. This keeps your network secure and protected.
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
  selector: {
    minWidth: 300,
    float: 'right',
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
