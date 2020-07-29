import { MUIDataTableTextLabels } from 'mui-datatables';
import React from 'react';

interface IArgs {
  globalSearch: boolean;
  loading: boolean;
  globalSearchMessage?: string;
}

export const useLocalization = ({
  globalSearch,
  loading,
  globalSearchMessage
}: IArgs): MUIDataTableTextLabels => {
  const [message, setMessage] = React.useState(`Search for a patient above by either Patient ID or Initials. If
  nothing matches your search criteria this page will remain blank`);

  React.useEffect((): void => {
    if (globalSearchMessage !== undefined) {
      setMessage(`No records to display`);
    }
  }, [globalSearchMessage]);



  const noMatchText = React.useMemo<string>((): string => {
    if (loading) {
      return `Fetching patient data...`;
    }

    return globalSearch ? `${message}` : `No records to display`;
  }, [globalSearch, loading, message]);

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
