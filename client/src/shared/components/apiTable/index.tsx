import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { SortDir } from './types';
import Pagination from './Pagination';
import SortBy from './SortBy';
import ScrollArrow from './ScrollArrow';
import { HeaderRow } from './HeaderRow';
import { apiFetch, API_URL } from 'src/shared/api';
import APIErrorToast from '../apiErrorToast/APIErrorToast';
import { useHistory } from 'react-router-dom';
import { ReferralFilter } from 'src/shared/types';
import { TrafficLightEnum } from 'src/shared/enums';

interface IProps {
  endpoint: string;
  search: string;
  columns: any;
  sortableColumns: any;
  rowKey: string;
  initialSortBy: string;
  initialSortDir: string;
  RowComponent: ({ row }: any) => JSX.Element;
  isTransformed: boolean;
  isDrugRecord?: boolean | undefined;
  patientId?: string;
  gestationalAgeUnit?: string;
  referralFilter?: ReferralFilter;
}

export const APITable = ({
  endpoint,
  search,
  columns,
  sortableColumns,
  rowKey, // a unique value in the row, e.g. patientId for patients
  initialSortBy,
  initialSortDir,
  RowComponent,
  isTransformed,
  isDrugRecord,
  patientId,
  gestationalAgeUnit,
  referralFilter,
}: IProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const history = useHistory();
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
      signal: controller.signal,
    };

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      search: search,
      sortBy: sortBy,
      sortDir: sortDir,
    });

    const referralFilterParams = referralFilter
      ? new URLSearchParams({
          healthFacility: referralFilter.healthFacilityName,
          referrer: referralFilter.referrer,
          dateRange: referralFilter.dateRange,
          vitalSigns: referralFilter.vitalSigns
            ? TrafficLightEnum[
                referralFilter.vitalSigns as keyof typeof TrafficLightEnum
              ]
            : '',
          isPregnant: referralFilter.isPregnant
            ? referralFilter.isPregnant.toString()
            : '',
          isAssessed: referralFilter.isAssessed
            ? referralFilter.isAssessed.toString()
            : '',
        })
      : '';

    apiFetch(
      API_URL + endpoint + '?' + params + referralFilterParams,
      fetchOptions
    )
      .then(async (resp) => {
        const json = await resp.json();
        //The case for drug history records on the past records page
        if (isDrugRecord === true) {
          setRows(json.drug);
          //The case for medical history records on the past records page
        } else if (isDrugRecord === false) {
          setRows(json.medical);
        } else {
          setRows(json);
        }
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
  }, [
    endpoint,
    limit,
    page,
    search,
    sortBy,
    sortDir,
    isDrugRecord,
    referralFilter,
  ]);

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
      <APIErrorToast
        open={loadingError}
        onClose={() => setLoadingError(false)}
      />
      <div className={classes.loadingWrapper}>
        {loading && <LinearProgress />}
      </div>
      {!isTransformed && initialSortBy && (
        <SortBy
          columns={columns}
          sortableColumns={sortableColumns}
          sortBy={sortBy}
          sortDir={sortDir}
          handleSort={handleSort}
        />
      )}
      {rows.length ? (
        <div className={isTransformed ? classes.tableWrapper : ''}>
          <table className={classes.table}>
            {isTransformed && (
              <thead>
                <HeaderRow
                  columns={columns}
                  sortableColumns={sortableColumns}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  handleSort={handleSort}
                />
              </thead>
            )}
            <tbody>
              {rows.map((r: any) => (
                <RowComponent
                  key={r[rowKey]}
                  row={r}
                  patientId={patientId}
                  unit={gestationalAgeUnit}
                  history={history}
                />
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
      <ScrollArrow />
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
