import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  linearProgress: {
    top: 0,
    left: 0,
    right: 0,
    position: `absolute`,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  toolbarActions: {
    display: `flex`,
    alignItems: `center`,
    paddingBlockStart: `${theme.spacing()}px`,
  },
  spacedAction: {
    marginInlineStart: `${theme.spacing()}px`,
  },
}));
