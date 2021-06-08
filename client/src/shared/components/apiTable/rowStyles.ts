import { makeStyles } from '@material-ui/core/styles';

export const useRowStyles = makeStyles({
  row: {
    cursor: 'pointer',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
  },
});
