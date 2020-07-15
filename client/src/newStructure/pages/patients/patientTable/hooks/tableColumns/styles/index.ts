import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headCell: {
    borderBlockEnd: `1px solid rgba(224, 224, 224, 1)`,
    display: `table-cell`,
    fontWeight: `normal`,
    padding: theme.spacing(2, 0),
    [`& > button`]: {
      marginBlockStart: `${theme.spacing(-0.5)}px`,
      marginInlineStart: `${theme.spacing(0.5)}px`,
    },
  },
  bodyCell: {
    display: `flex`,
    justifyContent: `center`,
    width: `100%`,
    height: `100%`,
  },
}));
