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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import { ReduxState } from 'src/redux/reducers';
import { SecretKeyState } from 'src/redux/reducers/secretKey';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled, SxProps } from '@mui/material/styles';
import { UserRoleEnum } from 'src/shared/enums';
import { Toast } from 'src/shared/components/toast';
import { Box } from '@mui/material';
import { useAppSelector } from 'src/shared/hooks';
import { selectCurrentUser } from 'src/redux/reducers/user/currentUser';

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
          backgroundColor: '#fff',
        }}>
        <Box
          sx={{
            padding: 15,
          }}>
          <Box
            sx={{
              display: 'inline-block',
            }}>
            <Typography
              variant={'h2'}
              sx={{
                fontSize: '1.7rem',
                display: 'inline-block',
              }}>
              SMS secret key detail
            </Typography>
          </Box>
          {role === UserRoleEnum.ADMIN && users.length > 1 && focusUserId && (
            <FormControl
              sx={{
                minWidth: '300px',
                float: 'right',
              }}>
              <Select
                id="focus-users"
                value={focusUserId + ''}
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
        <Box
          sx={{
            padding: '15px',
          }}>
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
        </Box>
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
