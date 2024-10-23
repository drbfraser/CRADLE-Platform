import React, { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { Box, Table } from '@mui/material';
import { SortDir } from './types';
import Pagination from './Pagination';
import SortBy from './SortBy';
import ScrollArrow from './ScrollArrow';
import { HeaderRow } from './HeaderRow';
import { apiFetch, API_URL } from 'src/shared/api';
import APIErrorToast from '../apiErrorToast/APIErrorToast';
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
  isReferralListPage?: boolean | undefined; //added for referral list page(2022 spring, v1.0 Feb 06)
  patientId?: string;
  gestationalAgeUnit?: string;
  referralFilter?: ReferralFilter;
  setDeletePopupOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setPopupRecord?: React.Dispatch<React.SetStateAction<any>>;
  refetch?: boolean;
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
  isReferralListPage,
  patientId,
  gestationalAgeUnit,
  referralFilter,
  setDeletePopupOpen,
  setPopupRecord,
  refetch,
}: IProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const prevPage = useRef(1);

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
          dateRange: referralFilter.dateRange,
          isPregnant: referralFilter.isPregnant
            ? referralFilter.isPregnant
            : '',
          isAssessed: referralFilter.isAssessed
            ? referralFilter.isAssessed
            : '',
        })
      : new URLSearchParams();

    if (referralFilter) {
      referralFilter.healthFacilityNames.forEach((facilityName) =>
        referralFilterParams.append('healthFacility', facilityName)
      );
      referralFilter.referrers.forEach((referrer) =>
        referralFilterParams.append('referrer', referrer)
      );
      referralFilter.vitalSigns.forEach((vitalSign) =>
        referralFilterParams.append(
          'vitalSigns',
          TrafficLightEnum[vitalSign as keyof typeof TrafficLightEnum]
        )
      );
    }

    apiFetch(
      API_URL + endpoint + '?' + params + '&' + referralFilterParams,
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
        } else if (isReferralListPage === true) {
          setRows(json);
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
    refetch,
    referralFilter,
    isReferralListPage,
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
      <Box sx={{ height: 15 }}>{loading && <LinearProgress />}</Box>
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
        <Box
          sx={{
            maxHeight: isTransformed ? '60vh' : '',
            overflowY: isTransformed ? 'auto' : '',
          }}>
          <Table
            sx={{
              width: '100%',
              textAlign: 'center',
            }}>
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
                  setDeletePopupOpen={setDeletePopupOpen}
                  setPopupRecord={setPopupRecord}
                />
              ))}
            </tbody>
          </Table>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            padding: '15px',
          }}>
          {loading ? 'Retrieving records...' : 'No records to display.'}
        </Box>
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
