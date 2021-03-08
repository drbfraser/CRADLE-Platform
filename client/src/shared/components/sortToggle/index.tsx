import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import { SortOrderEnum } from 'src/enums';
import Tooltip from '@material-ui/core/Tooltip';

interface IProps {
  sortOrder: SortOrderEnum;
  handleClick: () => void;
}

export const SortToggle: React.FC<IProps> = ({ sortOrder, handleClick }) => {
  return (
    <Tooltip
      placement="top"
      title={
        sortOrder === SortOrderEnum.ASC ? `Sort ascending` : `Sort descending`
      }>
      <IconButton onClick={handleClick}>
        {sortOrder === SortOrderEnum.ASC ? (
          <ArrowUpwardIcon color="inherit" fontSize="small" />
        ) : (
          <ArrowDownwardIcon color="inherit" fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};
