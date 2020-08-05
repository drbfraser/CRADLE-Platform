import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: `0 5%`,
    display: `grid`,
    gridTemplateRows: `repeat(4, auto)`,
    gridRowGap: theme.spacing(4),
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  headerSize: {
    fontSize: theme.typography.h4.fontSize,
  },
  statisticGroup: {
    margin: theme.spacing(0, `auto`),
    paddingBlockEnd: `${theme.spacing(2)}px`,
  },
  statistic: {
    width: 200,
    padding: theme.spacing(1, 0, 1, 2),
    border: `1px solid rgb(211, 205, 205)`,
    borderRadius: 7,
    boxShadow: `3px 1px rgb(211, 205, 205)`,
  },
  verticalWriting: {
    width: 100,
    margin: theme.spacing(0, `auto`),
    // lineHeight: `16px`,
  },
  underlineBlue: {
    borderBottom: `2px solid #4bc0c0`,
  },
  underlinePurple: {
    borderBottom: `2px solid #9400d3`,
  },
  underlineOrange: {
    borderBottom: `2px solid #ff7f50`,
  },
  underlineBlack: {
    borderBottom: `2px solid #15152b`,
  },
  chart: {
    width: `75%`,
  },
}));
