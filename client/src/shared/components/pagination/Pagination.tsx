import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { makeStyles } from '@material-ui/core/styles';

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

  return (
    <div className={classes.wrapper}>
      Records {startRecordNum} - {endRecordNum}. Rows per page: &nbsp;
      <Select
        value={limit}
        onChange={(e) => setLimit(e.target.value as number)}>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={50}>50</MenuItem>
      </Select>
      <IconButton disabled={!canPageBackward} onClick={() => setPage(page - 1)}>
        <NavigateBeforeIcon />
      </IconButton>
      <IconButton disabled={!canPageForward} onClick={() => setPage(page + 1)}>
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
});
