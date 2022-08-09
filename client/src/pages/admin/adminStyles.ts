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
  button: {
    height: '100%',
    marginLeft: 10,
  },
  right: {
    float: 'right',
    height: 56,
  },
});
