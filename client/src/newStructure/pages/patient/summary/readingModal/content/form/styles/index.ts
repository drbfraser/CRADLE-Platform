import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    padding: theme.spacing(4, 3),
    borderRadius: 15,
  },
  symptomFormContainer: {
    marginBlockStart: `${theme.spacing(3)}px`,
  },
}));
