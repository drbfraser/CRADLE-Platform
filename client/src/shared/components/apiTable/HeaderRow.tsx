import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import { SortDir } from './types';
import SortIcon from '@mui/icons-material/Sort';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  columns: any;
  sortableColumns: any;
  sortBy: string;
  sortDir: string;
  handleSort: (col: string) => void;
}

export const HeaderRow = ({
  columns,
  sortBy,
  sortableColumns,
  sortDir,
  handleSort,
}: IProps) => {
  const classes = useStyles();

  return (
    <tr className={classes.row}>
      {Object.entries(columns).map(([col, name], index) => (
        <th className={classes.cell} key={col}>
          {name}
          {sortableColumns[index] && (
            <IconButton onClick={() => handleSort(col)} size="large">
              {sortBy === col ? (
                sortDir === SortDir.ASC ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )
              ) : (
                <SortIcon />
              )}
            </IconButton>
          )}
        </th>
      ))}
    </tr>
  );
};

const useStyles = makeStyles({
  row: {
    height: '60px',
  },
  cell: {
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
  },
});
