import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    backgroundColor: '#15152B',
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbarButtons: {
    marginLeft: 'auto',
    marginRight: -12,
  },
  toolbarButtonsPadded: {
    marginLeft: 'auto',
    paddingLeft: 30,
    paddingRight: 30,
  },
  drawer: {
    width: 200,
    flexShrink: 0,
  },
  drawerPaper: {
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#3b679e+0,34787e+0,45889f+51,65a6df+100 */
    background: '#3b679e' /* Old browsers */,
    //@ts-ignore
    background:
      '-moz-linear-gradient(top,  #3b679e 0%, #34787e 0%, #45889f 51%, #65a6df 100%)' /* FF3.6-15 */,
    //@ts-ignore
    background:
      '-webkit-linear-gradient(top,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)' /* Chrome10-25,Safari5.1-6 */,
    //@ts-ignore
    background:
      'linear-gradient(to bottom,  #3b679e 0%,#34787e 0%,#45889f 51%,#65a6df 100%)' /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */,
    filter:
      "progid:DXImageTransform.Microsoft.gradient( startColorstr='#3b679e', endColorstr='#65a6df',GradientType=0 )" /* IE6-9 */,

    width: 200,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  listItem: { flexDirection: 'column', margin: '10px 0px 10px 0px' },
  logout: { marginTop: '20px', bottom: 0 },
  itemText: { color: 'white', paddingTop: '8px' },
}));