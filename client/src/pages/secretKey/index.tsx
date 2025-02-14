import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Paper,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  styled,
  SxProps,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { UserRoleEnum } from 'src/shared/enums';
import { ReduxState } from 'src/redux/reducers';
import { SecretKeyState } from 'src/redux/reducers/secretKey';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';
import { useSecretKey } from 'src/shared/hooks/secretKey';
import { useAppSelector } from 'src/shared/hooks';
import { Toast } from 'src/shared/components/toast';

const SecretKeyPage: React.FC = () => {
  const [showPassword, setShowPassWord] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<boolean>(false);
  const { data: currentUser } = useAppSelector(selectCurrentUser);
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
  } = useSecretKey(secretKey, currentUser, setShowModal, setUpdateMessage);
  return (
    <>
      <Toast
        severity="success"
        message={'Your key is updated'}
        open={updateMessage}
        onClose={() => setUpdateMessage(false)}
      />
      <Paper
        sx={{
          padding: '25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}>
        <Box>
          <Typography
            variant={'h2'}
            sx={{
              fontSize: '1.7rem',
            }}>
            SMS secret key detail
          </Typography>

          {role === UserRoleEnum.ADMIN && users.length > 1 && focusUserId && (
            <FormControl
              sx={{
                minWidth: '300px',
              }}>
              <Select
                id="focus-users"
                value={focusUserId.toString()}
                onChange={handleUserSelect}>
                {users.map((user, index) => (
                  <MenuItem key={index} value={user.id}>
                    {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Your SMS Key Details
            </Typography>
            {role === UserRoleEnum.ADMIN && (
              <Box>
                <PasswordViewer
                  focused={false}
                  label="Key"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={currentSecretKey?.smsKey}
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
              </Box>
            )}
            <Box sx={SECTION_SX}>
              <Typography color="text.secondary" gutterBottom>
                Expiry date
              </Typography>
              <Typography>
                {currentSecretKey
                  ? currentSecretKey.expiryDate.split(' ')[0]
                  : 'No stale date available'}
              </Typography>
            </Box>
            <Box sx={SECTION_SX}>
              <Typography color="text.secondary" gutterBottom>
                Stale Day
              </Typography>
              <Typography>
                {currentSecretKey
                  ? currentSecretKey.staleDate.split(' ')[0]
                  : 'No stale date available'}
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button size="medium" onClick={() => setShowModal(true)}>
              Learn More
            </Button>
          </CardActions>
        </Card>
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
            like a deadline. After this date, the server will not let your
            mobile device send any more messages.
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

const SECTION_SX: SxProps = {
  marginTop: '30px',
};

const PasswordViewer = styled(TextField)({
  '& .MuiInputLabel-root': {
    display: 'none',
  },
});

export default SecretKeyPage;
