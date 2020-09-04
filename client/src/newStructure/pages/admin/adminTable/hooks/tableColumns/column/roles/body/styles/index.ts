import { Theme, makeStyles } from '@material-ui/core/styles';

interface IProps {
  numberOfRoles: number;
}

export const useStyles = makeStyles((theme: Theme) => ({
  roles: {
    padding: theme.spacing(1, 0),
    display: `grid`,
    gridTemplateRows: ({ numberOfRoles }: IProps): string => {
      return `repeat(1fr, ${numberOfRoles})`;
    },
    gridRowGap: theme.spacing(),
    [`& > *`]: {
      textAlign: `center`,
    },
  },
}));
