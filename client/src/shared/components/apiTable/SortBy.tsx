import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { SortDir } from './types';

interface SortByProps {
  columns: { [key: string]: string };
  sortBy: string;
  sortDir: string;
  handleSort: (col: string) => void;
}

const SortBy = ({ columns, sortBy, sortDir, handleSort }: SortByProps) => {
  const classes = useStyles();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSort(e.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel>Sort by</InputLabel>
        <Select value={sortBy} onChange={handleChange}>
          {Object.entries(columns).map(([col, name]) => (
            <MenuItem key={col} value={col}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton
        className={classes.iconButton}
        onClick={() => handleSort(sortBy)}>
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
