import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  subtitle: {
    marginBlockStart: `${theme.spacing(-3)}px`,
  },
  actions: {
    display: `flex`,
    padding: theme.spacing(2),
  },
  leftActions: {
    justifySelf: `flex-start`,
  },
  rightActions: {
    justifySelf: `flex-end`,
    [`& > * + *`]: {
      marginInlineStart: `${theme.spacing(2)}px`,
    },
  },
}));
