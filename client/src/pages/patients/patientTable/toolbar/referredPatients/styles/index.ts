import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginInlineStart: `${theme.spacing()}px`,
  },
}));
