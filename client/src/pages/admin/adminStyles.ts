import { makeStyles } from '@material-ui/core/styles';

export const useAdminStyles = makeStyles({
  tableContainer: {
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
    },
    '& .MuiTableSortLabel-icon': {
      marginTop: 15,
    },
  },
  row: {
    borderBottom: '1px solid #ddd',
  },
  cell: {
    padding: '4px 16px',
  },
  button: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    margin: 'auto',
  },
});
