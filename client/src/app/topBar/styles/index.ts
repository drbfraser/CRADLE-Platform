import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import { TOP_BAR_HEIGHT } from 'src/shared/constants';

export const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: `#15152B`,
    zIndex: theme.zIndex.drawer + 1,
    height: TOP_BAR_HEIGHT,
  },
  toolbarButtons: {
    marginLeft: `auto`,
  },
  toolbarButtonsPadded: {
    marginLeft: `auto`,
  },
  title: {
    fontFamily: `Open Sans`,
    fontWeight: `bold`,
    fontSize: 36,
  },
  navRightIcons: {
    margin: theme.spacing(0, 0, 0, `auto`),
  },
}));
