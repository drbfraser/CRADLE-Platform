import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(4, 3),
    borderRadius: 15,
    width: `100%`,
    minWidth: `450px`,
    float: `left`,
  },
  input: {
    appearance: `none`,
    margin: 0,
  },
}));
