import React from 'react';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import SortIcon from '@material-ui/icons/Sort';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { SortDir } from './types';

interface IProps {
  columns: any;
  sortBy: string;
  sortDir: string;
  handleSort: (col: string) => void;
}

export const HeaderRow = ({ columns, sortBy, sortDir, handleSort }: IProps) => {
  const classes = useStyles();

  return (
    <tr className={classes.row}>
      {Object.entries(columns).map(([col, name]) => (
        <th className={classes.cell} key={col}>
          {name}
          <IconButton onClick={() => handleSort(col)}>
            {sortBy === col ? (
              sortDir === SortDir.ASC ? (
                <ArrowDownwardIcon />
              ) : (
                <ArrowUpwardIcon />
              )
            ) : (
              <SortIcon />
            )}
          </IconButton>
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
