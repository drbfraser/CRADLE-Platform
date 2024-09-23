import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import { SortDir } from './types';
import SortIcon from '@mui/icons-material/Sort';
import { TableRow, TableCell } from '@mui/material';

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
  return (
    <TableRow>
      {Object.entries(columns).map(([col, name], index) => (
        <TableCell
          key={col}
          sx={{
            backgroundColor: '#fff',
            position: 'sticky',
            top: '0px',
            textAlign: 'center',
            fontWeight: '700',
          }}>
          {name}
          {sortableColumns[index] && (
            <IconButton
              size="large"
              onClick={() => handleSort(col)}
              sx={{
                marginLeft: '4px',
                marginRight: '-4px',
              }}>
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
        </TableCell>
      ))}
    </TableRow>
  );
};
