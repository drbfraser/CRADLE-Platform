import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
  row: {
    display: `table-row`,
    borderBlockEnd: `1px solid rgba(224, 224, 224, 1)`,
    height: 75,
    transition: `all 300ms ease-in-out`,
    [`&:focus`]: {
      backgroundColor: `rgba(0, 0, 0, 0.04)`,
    },
    [`&:hover`]: {
      backgroundColor: `rgba(0, 0, 0, 0.04)`,
    },
  },
});
