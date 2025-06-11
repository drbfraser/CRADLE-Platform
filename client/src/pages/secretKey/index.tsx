import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { useSecretKey } from 'src/pages/secretKey/useSecretKey';
import { Toast } from 'src/shared/components/toast';
import { getUsersAsync } from 'src/shared/api';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

const SecretKeyPage: React.FC = () => {
  const currentUser = useCurrentUser();

  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(
    currentUser?.id
  );
  const handleUserSelect = (event: SelectChangeEvent<string>) => {
    const currId = event.target.value;
    if (typeof currId === 'number') {
      setSelectedUserId(currId);
    }
  };

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: getUsersAsync,
    enabled: currentUser?.role === UserRoleEnum.ADMIN,
  });
  const users = usersQuery.data ?? [];

  const {
    currentSecretKey,
    updateSecretKey,
    updateSecretKeySuccess,
    resetSecretKeyMutation,
  } = useSecretKey(currentUser, selectedUserId);

  return (
    <>
      <Toast
        severity="success"
        message={'Your key is updated'}
        open={updateSecretKeySuccess}
        onClose={() => resetSecretKeyMutation()}
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

          {currentUser?.role === UserRoleEnum.ADMIN &&
            users.length > 1 &&
            selectedUserId && (
              <FormControl
                sx={{
                  minWidth: '300px',
                }}>
                <Select
                  id="focus-users"
                  value={selectedUserId.toString()}
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
            {currentUser?.role === UserRoleEnum.ADMIN && (
              <PasswordViewer
                focused={false}
                label="Key"
                type={showSecretKey ? 'text' : 'password'}
                fullWidth
                value={currentSecretKey?.key}
                variant="filled"
                aria-readonly
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowSecretKey((prev) => !prev)}
                        edge="end">
                        {showSecretKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
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
          <CardActions
            sx={{
              justifyContent: 'space-around',
            }}>
            <Button size="medium" onClick={() => setShowModal(true)}>
              Learn More
            </Button>
            <Button size="medium" onClick={updateSecretKey}>
              Update key
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
            important dates:
            <br />
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
