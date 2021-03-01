import { MUIDataTableTextLabels } from 'mui-datatables';
import { OrUndefined } from 'src/types';
import React from 'react';

interface IArgs {
  loading: boolean;
  loadingText: string;
  globalSearch?: boolean;
  initialMessage?: string;
  searchText?: string;
}

export const useLocalization = ({
  loading,
  loadingText,
  globalSearch,
  initialMessage,
  searchText,
}: IArgs): MUIDataTableTextLabels => {
  const [message, setMessage] = React.useState<OrUndefined<string>>(
    initialMessage
  );

  React.useEffect((): void => {
    if (searchText !== undefined) {
      setMessage(`No records to display`);
    }
  }, [searchText]);

  const noMatch = React.useMemo<string>((): string => {
    if (loading) {
      return loadingText;
    }

    return globalSearch ? `${message}` : `No records to display`;
  }, [globalSearch, loading, loadingText, message]);

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
