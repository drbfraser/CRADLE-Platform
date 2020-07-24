import { MUIDataTableTextLabels } from 'mui-datatables';
import React from 'react';

interface IArgs {
  loading: boolean;
  globalSearch?: boolean;
}

export const useLocalization = ({
  loading,
  globalSearch,
}: IArgs): MUIDataTableTextLabels => {
  const noMatch = React.useMemo<string>((): string => {
    if (loading) {
      return `Fetching patient data...`;
    }

    return globalSearch
      ? `Search for a patient above by either Patient ID or Initials. If
            nothing matches your search criteria this page will remain blank`
      : `No records to display`;
  }, [globalSearch, loading]);

  return React.useMemo((): MUIDataTableTextLabels => {
    return {
      body: {
        noMatch,
      },
      filter: {},
      pagination: {},
      selectedRows: {},
      toolbar: {},
      viewColumns: {},
    };
  }, [noMatch]);
};
