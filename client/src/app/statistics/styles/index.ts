import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  menuPaper: {
    width: `fit-content`,
    borderRadius: 15,
    backgroundImage: `linear-gradient( #64b1c6 , rgb(114, 193, 212))`,
    color: `#F9FAFC`,
    marginInlineEnd: `${theme.spacing(2)}px`,
    left: `224px !important`,
  },
}));
