import makeStyles from '@mui/styles/makeStyles';

export const useAdminStyles = makeStyles({
  tableContainer: {
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
    },
    '& .MuiTableSortLabel-icon': {
      marginTop: 15,
    },
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    borderBottom: '1px solid #ddd',
  },
  cell: {
    padding: '4px 16px',
  },
  right: {
    float: 'right',
  },
  text: {
    marginRight: 10,
    marginBottom: 10,
  },
  buttonL: {
    '@media (max-width: 650px)': {
      marginBottom: 10,
    },
    '@media (min-width: 900px)': {
      height: 56,
    },
  },
  buttonR: {
    '@media (min-width: 899px)': {
      height: 56,
    },
    '@media (min-width: 1068px)': {
      marginLeft: 10,
    },
  },
});
