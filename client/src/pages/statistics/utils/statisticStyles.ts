import makeStyles from '@mui/styles/makeStyles';

export const useStatisticsStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: 0,
    height: '100%',
    position: 'relative',
    resize: 'both',
  },
  formControl: {
    margin: '4px 8px',
    minWidth: 180,
  },
  floatLeft: {
    float: 'left',
  },
  floatRight: {
    float: 'right',
  },
  divider: {
    margin: '20px 0',
  },
  right: { marginBottom: '10px' },
  inputLabel: {
    fontSize: '50',
  },
  statistic: {
    width: 200,
    height: 100,
    padding: theme.spacing(1, 0, 1, 2),
    border: `1px solid rgb(211, 205, 205)`,
    borderRadius: 7,
    boxShadow: `3px 1px rgb(211, 205, 205)`,
  },
  verticalWriting: {
    width: 100,
    margin: theme.spacing(0, `auto`),
  },
  container: {
    margin: 'auto',
  },
  statisticGroup: {
    paddingBlockEnd: theme.spacing(2),
  },
  chart: {
    position: 'relative',
    margin: 'auto',
    width: `100%`,
    height: '100%',
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  tabStyle: {
    display: `fluid`,
    flexDirection: `row`,
    flexWrap: `wrap`,
  },
}));
