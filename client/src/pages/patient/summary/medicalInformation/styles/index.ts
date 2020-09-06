import { Theme, makeStyles } from '@material-ui/core/styles';

interface IProps {
  history: boolean;
}

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: 500,
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: 15,
    height: `100%`,
  },
  header: {
    display: `flex`,
    alignItems: `center`,
    [`& > :first-child`]: {
      marginInlineEnd: `${theme.spacing()}px`,
    },
  },
  content: {
    display: `flex`,
    flexDirection: `column`,
    [`& > button`]: {
      alignSelf: `flex-start`,
      marginBlockStart: ({ history }: IProps): number | string =>
        history ? `${theme.spacing(2)}px` : 0,
    },
  },
}));
