import { Theme, makeStyles } from '@material-ui/core/styles';

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
