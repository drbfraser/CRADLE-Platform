import { LoginForm } from './form';
import { Redirect } from 'react-router-dom';
import image from './img/splash_screen_4.png';
import { useStyles } from './styles';
import Stack from '@mui/material/Stack';
import { Box, useMediaQuery } from '@mui/material';
import { TOP_BAR_HEIGHT } from 'src/shared/constants';

export const LoginPage: React.FC = () => {
  const classes = useStyles();

  // if the user has reached the login page, they likely came directly here
  // therefore Redux will be empty and we must check local storage for a token
  if (localStorage.getItem('token') !== null) {
    return <Redirect to="/referrals" />;
  }

  /**
   * When the aspect ratio of the window is too low, the splash image on the
   * login page causes issues where the login form becomes inaccessible. To
   * prevent this from happening, we can conditionally render the image only
   * when the window is above a certain aspect ratio. The exact value for the
   * aspect ratio threshold may need further tweaking in the future if it is
   * found to not be sufficient for all cases.
   */
  const aspectRatioThreshold = useMediaQuery('(min-aspect-ratio:1.3/1)');

  // Below this height, the image starts to get messed up.
  const minHeight = useMediaQuery('(min-height:500px)');
  const showImage = aspectRatioThreshold && minHeight;

  return (
    <Stack
      direction={'row'}
      sx={{
        height: '100%',
        maxHeight: '100%',
      }}>
      {showImage && (
        <Box
          id="loginSplashImageContainer"
          sx={{
            height: '100%',
            width: 'auto',
            maxHeight: `calc(100vh - ${TOP_BAR_HEIGHT})`,
          }}>
          <img alt="logo" src={image} className={classes.imgStyle} />
        </Box>
      )}

      <LoginForm />
    </Stack>
  );
};
