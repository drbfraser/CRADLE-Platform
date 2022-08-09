import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  topBarOffset?: number;
}

export const useStyles = makeStyles((theme: Theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginBlockStart: ({ topBarOffset }: IProps): string | number => {
      return topBarOffset ? `${topBarOffset}px` : 0;
    },
  },
}));
