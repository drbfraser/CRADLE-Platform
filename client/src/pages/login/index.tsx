import { Navigate } from 'react-router-dom';
import image from './img/splash_screen_4.png';
import Stack from '@mui/material/Stack';
import { Box, useMediaQuery } from '@mui/material';
import { DASHBOARD_PADDING, TOP_BAR_HEIGHT } from 'src/shared/constants';
import { LoginForm } from './LoginForm';

import { selectIsLoggedIn } from 'src/redux/user-state';
import { useAppSelector } from 'src/shared/hooks';

export const LoginPage: React.FC = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  // if the user has reached the login page, they likely came directly here
  // therefore Redux will be empty and we must check local storage for a token
  if (localStorage.getItem('accessToken') !== null) {
    return <Navigate to={'/referrals'} replace />;
  }

  return isLoggedIn ? (
    <Navigate to={'/referrals'} replace />
  ) : (
    <Stack
      direction={'row'}
      sx={{
        height: '100%',
        maxHeight: '100%',
      }}>
      <LoginSplashImage />
      <LoginForm />
    </Stack>
  );
};

const NEGATIVE_MARGIN = '-' + DASHBOARD_PADDING;

const LoginSplashImage = () => {
  /**
   * When the aspect ratio of the window is too low, the splash image on the
   * login page causes issues where the login form becomes inaccessible. To
   * prevent this from happening, we can conditionally render the image only
   * when the window is above a certain aspect ratio. The exact value for the
   * aspect ratio threshold may need further tweaking in the future if it is
   * found to not be sufficient for all cases.
   */
  const showImage = useMediaQuery(
    '(min-aspect-ratio:1.3/1) and (min-height:500px)'
  );
  return showImage ? (
    <Box
      id="loginSplashImageContainer"
      sx={{
        height: '100%',
        width: 'auto',
        maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})`,
        marginY: NEGATIVE_MARGIN,
        marginLeft: NEGATIVE_MARGIN,
      }}>
      <Box
        component="img"
        alt="logo"
        src={image}
        sx={{
          maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})`,
        }}
      />
    </Box>
  ) : null;
};
