import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: `#15152B`,
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbarButtons: {
    marginLeft: `auto`,
    marginRight: -12,
  },
  toolbarButtonsPadded: {
    marginLeft: `auto`,
    paddingLeft: 30,
    paddingRight: 30,
  },
  title: {
    fontFamily: `Open Sans`,
    fontWeight: `bold`,
    fontSize: 36,
  },
  navRightIcons: {
    margin: theme.spacing(0, 0, 0, `auto`),
  },
}));
