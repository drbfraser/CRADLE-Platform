import { MUIDataTableTextLabels } from 'mui-datatables';
import React from 'react';

interface IArgs {
  globalSearch: boolean;
  loading: boolean;
  globalSearchMessage: string;
}

export const useLocalization = ({
  globalSearch,
  loading,
  globalSearchMessage,
}: IArgs): MUIDataTableTextLabels => {
  const noMatchText = React.useMemo<string>((): string => {
    if (loading) {
      return `Fetching patient data...`;
    }

    return globalSearch ? `${globalSearchMessage}` : `No records to display`;
  }, [globalSearch, loading, globalSearchMessage]);

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
