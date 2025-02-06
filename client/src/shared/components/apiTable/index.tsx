import React, { useEffect, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Box, Table, LinearProgress } from '@mui/material';

import { ReferralFilter } from 'src/shared/types';
import { TrafficLightEnum } from 'src/shared/enums';
import { axiosFetch } from 'src/shared/api/api';
import APIErrorToast from '../apiErrorToast/APIErrorToast';
import { SortDir } from './types';
import Pagination from './Pagination';
import SortBy from './SortBy';
import ScrollArrow from './ScrollArrow';
import { HeaderRow } from './HeaderRow';

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const prevPage = useRef(1);

  useEffect(() => {
    // if the user changed something other than the page number
    // then reset to page 1
    if (page === prevPage.current && page !== 1) {
      setPage(1);
      return;
    } else {
      prevPage.current = page;
    }
  }, [
    limit,
    page,
    sortBy,
    sortDir,
    search,
    referralFilter,
    isReferralListPage,
    refetch,
  ]);

  const { data, isFetching, isLoading, isError } = useQuery({
    queryKey: [
      `${endpoint}TableRows`,
      sortDir,
      sortBy,
      search,
      referralFilter,
      refetch,
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search,
        sortBy,
        sortDir,
      });
      if (referralFilter) {
        if (referralFilter.dateRange !== '') {
          params.append('dateRange', referralFilter.dateRange);
        }
        if (referralFilter.isPregnant) {
          params.append('isPregnant', referralFilter.isPregnant);
        }
        if (referralFilter.isAssessed) {
          params.append('isAssessed', referralFilter.isAssessed);
        }
        referralFilter.healthFacilityNames.forEach((facilityName) =>
          params.append('healthFacility', facilityName)
        );
        referralFilter.referrers.forEach((referrer) =>
          params.append('referrer', referrer)
        );
        referralFilter.vitalSigns.forEach((vitalSign) =>
          params.append(
            'vitalSigns',
            TrafficLightEnum[vitalSign as keyof typeof TrafficLightEnum]
          )
        );
      }

      return axiosFetch({ method: 'GET', url: endpoint, params }).then(
        (resp) => {
          const data = resp.data;
          if (isDrugRecord === true) {
            return data.drug;
          } else if (isDrugRecord === false) {
            return data.medical;
          } else {
            return data;
          }
        }
      );
    },
    placeholderData: keepPreviousData,
  });
  const rows = data ?? [];

  const handleSort = (col: string) => {
    if (col === sortBy) {
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(col);
      setSortDir(SortDir.ASC);
    }
  };

  return (
    <>
      {isError && <APIErrorToast onClose={() => {}} />}

      <Box sx={{ height: 15 }}>{isFetching && <LinearProgress />}</Box>
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
          {isLoading ? 'Retrieving records...' : 'No records to display.'}
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
