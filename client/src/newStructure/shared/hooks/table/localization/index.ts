import { MUIDataTableTextLabels } from 'mui-datatables';
import React from 'react';

interface IArgs {
  loading: boolean;
  globalSearch: boolean;
  searchText?: string;
}

export const useLocalization = ({
  loading,
  globalSearch,
  searchText,
}: IArgs): MUIDataTableTextLabels => {
  const [
    message,
    setMessage,
  ] = React.useState(`Search for a patient above by either Patient ID or Initials. If
  nothing matches your search criteria this page will remain blank`);

  React.useEffect((): void => {
    if (searchText !== undefined) {
      setMessage(`No records to display`);
    }
  }, [searchText]);

  const noMatch = React.useMemo<string>((): string => {
    if (loading) {
      return `Fetching patient data...`;
    }

    return globalSearch ? `${message}` : `No records to display`;
  }, [globalSearch, loading, message]);

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
