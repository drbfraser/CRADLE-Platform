import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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
  const classes = useStyles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSort(e.target.value);
  };

  return (
    <div>
      <FormControl variant="standard" className={classes.formControl}>
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
        className={classes.iconButton}
        onClick={() => handleSort(sortBy)}
        size="large">
        {sortDir === SortDir.ASC ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
      </IconButton>
    </div>
  );
};

export default SortBy;

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
    minWidth: '140px',
  },
  iconButton: {
    verticalAlign: 'bottom',
    marginLeft: theme.spacing(1),
  },
}));
