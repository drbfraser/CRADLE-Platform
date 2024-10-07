import Select, { SelectChangeEvent } from '@mui/material/Select';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { SortDir } from './types';

interface SortByProps {
  columns: { [key: string]: string };
  sortableColumns: any;
  sortBy: string;
  sortDir: string;
  handleSort: (col: string) => void;
}

const SortBy = ({
  columns,
  sortableColumns,
  sortBy,
  sortDir,
  handleSort,
}: SortByProps) => {
  const handleChange = (
    e: SelectChangeEvent<string>,
    child: React.ReactNode
  ) => {
    handleSort(e.target.value);
  };

  return (
    <div>
      <FormControl
        variant="standard"
        sx={(theme) => ({
          marginLeft: theme.spacing(2),
          marginBottom: theme.spacing(1),
          minWidth: '140px',
        })}>
        <InputLabel>Sort by</InputLabel>
        <Select variant="standard" value={sortBy} onChange={handleChange}>
          {Object.entries(columns).map(
            ([col, name], index) =>
              sortableColumns[index] && (
                <MenuItem key={col} value={col}>
                  {name}
                </MenuItem>
              )
          )}
        </Select>
      </FormControl>
      <IconButton
        sx={(theme) => ({
          verticalAlign: 'bottom',
          marginLeft: theme.spacing(1),
        })}
        onClick={() => handleSort(sortBy)}
        size="large">
        {sortDir === SortDir.ASC ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
      </IconButton>
    </div>
  );
};

export default SortBy;
