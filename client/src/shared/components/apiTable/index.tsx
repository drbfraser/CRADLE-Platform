import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Toast } from '../toast';
import { SortDir } from './types';
import Pagination from './Pagination';
import { HeaderRow } from './HeaderRow';
import { BASE_URL } from '../../../../src/server/utils';
import { EndpointEnum } from '../../../../src/server';

interface IProps {
  endpoint: EndpointEnum;
  search: string;
  columns: any;
  rowKey: string;
  RowComponent: ({ row }: any) => JSX.Element;
}

export const APITable = ({
  endpoint,
  search,
  columns,
  rowKey, // a unique value in the row, e.g. patientId for patients
  RowComponent,
}: IProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('patientName');
  const [sortDir, setSortDir] = useState(SortDir.ASC);
  const prevPage = useRef(1);

  const classes = useStyles();

  // when something changes, load new data
  useEffect(() => {
    // if the user changed something other than the page number
    // then reset to page 1
    if (page === prevPage.current && page !== 1) {
      setPage(1);
      return;
    } else {
      prevPage.current = page;
    }

    setLoading(true);

    // allow aborting a fetch early if the user clicks things rapidly
    const controller = new AbortController();

    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      signal: controller.signal,
    };

    const params =
      '?' +
      new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search: search,
        sortBy: sortBy,
        sortDir: sortDir,
      });

    fetch(BASE_URL + endpoint + params, fetchOptions)
      .then(async (resp) => {
        const json = await resp.json();
        setRows(json);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setLoadingError(true);
          setLoading(false);
        }
      });

    // if the user does something else, cancel the fetch
    return () => controller.abort();
  }, [endpoint, limit, page, search, sortBy, sortDir]);

  const handleSort = (col: string) => {
    if (col === sortBy) {
      // swap direction
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(col);
      setSortDir(SortDir.ASC);
    }
  };

  return (
    <>
      {loadingError && (
        <Toast
          status="error"
          message="Something went wrong on our end. Please try that again."
          clearMessage={() => setLoadingError(false)}
        />
      )}
      <div className={classes.loadingWrapper}>
        {loading && <LinearProgress />}
      </div>
      {rows.length ? (
        <div className={classes.tableWrapper}>
          <table className={classes.table}>
            <thead>
              <HeaderRow
                columns={columns}
                sortBy={sortBy}
                sortDir={sortDir}
                handleSort={handleSort}
              />
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <RowComponent key={r[rowKey]} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={classes.messageWrapper}>
          {loading ? 'Retrieving records...' : 'No records to display.'}
        </div>
      )}
      <Pagination
        dataLen={rows.length}
        page={page}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
      />
    </>
  );
};

const useStyles = makeStyles({
  loadingWrapper: {
    height: 15,
  },
  tableWrapper: {
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  messageWrapper: {
    textAlign: 'center',
    padding: '15px',
  },
  table: {
    width: '100%',
    textAlign: 'center',
  },
});
