import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

import { OrUndefined } from 'src/shared/types';

interface IProps {
  drawerWidth?: number;
  offsetFromTop?: number;
}

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: `flex`,
  },
  sidebar: {
    fontFamily: `Open Sans`,
    fontWeight: 300,
    fontSize: 18,
  },
  drawer: {
    width: ({ drawerWidth }: IProps): OrUndefined<number> => {
      return drawerWidth;
    },
    flexShrink: 0,
  },
  drawerPaper: {
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#3b679e+0,34787e+0,45889f+51,65a6df+100 */
    background: `linear-gradient(to bottom,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)`,
    filter:
      'progid:DXImageTransform.Microsoft.gradient( startColorstr=`#3b679e`, endColorstr=`#65a6df`,GradientType=0 )' /* IE6-9 */,
    width: ({ drawerWidth }: IProps): OrUndefined<number> => {
      return drawerWidth;
    },
  },
  toolbar: theme.mixins.toolbar,
  listItem: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  icon: {
    color: `#F9FAFC`,
    justifyContent: `center`,
  },
  listItemInner: {
    border: `5px solid #F9FAFC`,
    borderRadius: 15,
  },
  itemText: {
    color: `white`,
    paddingBlockStart: theme.spacing(),
  },
}));
