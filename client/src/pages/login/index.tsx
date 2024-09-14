import { LoginForm } from './form';
import { Redirect } from 'react-router-dom';
import image from './img/splash_screen_4.png';
// import { useDimensionsContext } from 'src/app/context/hooks';
import { useStyles } from './styles';
import Stack from '@mui/material/Stack';
import { Box, useMediaQuery } from '@mui/material';
import { TOP_BAR_HEIGHT } from 'src/shared/constants';

export const LoginPage: React.FC = () => {
  const classes = useStyles();
  // const { isBigScreen } = useDimensionsContext();

  // if the user has reached the login page, they likely came directly here
  // therefore Redux will be empty and we must check local storage for a token
  if (localStorage.getItem('token') !== null) {
    return <Redirect to="/referrals" />;
  }

  const aspectRatioMediaQuery = useMediaQuery('(min-aspect-ratio:1.3/1)');

  return (
    <Stack
      direction={'row'}
      sx={{
        height: '100%',
        maxHeight: '100%',
      }}>
      {/* {isBigScreen && aspectRatioMediaQuery && ( */}
      {aspectRatioMediaQuery && (
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
