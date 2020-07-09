import { MUIDataTableTextLabels } from 'mui-datatables';
import React from 'react';

interface IArgs {
  globalSearch: boolean;
  loading: boolean;
}

export const useLocalization = ({
  globalSearch,
  loading,
}: IArgs): MUIDataTableTextLabels => {
  const noMatchText = React.useMemo<string>((): string => {
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
        noMatch: noMatchText,
      },
      filter: {},
      pagination: {},
      selectedRows: {},
      toolbar: {},
      viewColumns: {},
    };
  }, [noMatchText]);
};
