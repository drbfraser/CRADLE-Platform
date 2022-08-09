import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import React from 'react';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface IProps {
  dataLen: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const Pagination = ({ dataLen, page, limit, setPage, setLimit }: IProps) => {
  const classes = useStyles();

  const startRecordNum = (page - 1) * limit + 1;
  const endRecordNum = startRecordNum + dataLen - 1;
  const canPageBackward = page !== 1;
  // since we don't know how many records there are
  // guess that if we're at the limit there are more
  const canPageForward = dataLen === limit;

  const isBigScreen = useMediaQuery('(min-width:560px)');

  return (
    <div className={isBigScreen ? classes.wrapper : classes.wrapperThin}>
      Records {startRecordNum} - {endRecordNum}.{isBigScreen ? ' ' : <br />}Rows
      per page: &nbsp;
      <Select
        variant="standard"
        value={limit}
        onChange={(e) => setLimit(e.target.value as number)}>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
      </Select>
      <IconButton
        disabled={!canPageBackward}
        onClick={() => setPage(page - 1)}
        size="large">
        <NavigateBeforeIcon />
      </IconButton>
      <IconButton
        disabled={!canPageForward}
        onClick={() => setPage(page + 1)}
        size="large">
        <NavigateNextIcon />
      </IconButton>
    </div>
  );
};

export default Pagination;

const useStyles = makeStyles({
  wrapper: {
    textAlign: 'right',
    padding: 15,
  },
  wrapperThin: {
    marginLeft: '5px',
    padding: 15,
  },
});
