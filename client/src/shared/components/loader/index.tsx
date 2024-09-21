import { useEffect, useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import { OrUndefined } from 'src/shared/types';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

interface IProps {
  message: string;
  show: boolean;
  className?: string;
  timeout?: number;
}

export const Loader: React.FC<IProps> = ({ timeout = 500, message, show }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect((): void | (() => void) => {
    if (timeout === 0) {
      setShowLoader(true);
      return;
    }

    let time: OrUndefined<NodeJS.Timeout>;

    // * Provides better user experience
    // * If content loads within timeout
    // * Then loader does not need to be shown
    if (show) {
      time = setTimeout(() => {
        setShowLoader(true);
      }, timeout);
    }

    return (): void => {
      if (time) {
        clearTimeout(time);
      }
    };
  }, [show, timeout]);

  return showLoader ? (
    <Box
      sx={(theme) => ({
        marginBlockStart: theme.spacing(2),
        width: `100%`,
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
        justifyContent: `center`,
        [`& > p`]: {
          marginBlockStart: theme.spacing(2),
        },
      })}>
      <CircularProgress color="primary" />
      <Typography component="p" paragraph={true}>
        {message}
      </Typography>
    </Box>
  ) : null;
};
