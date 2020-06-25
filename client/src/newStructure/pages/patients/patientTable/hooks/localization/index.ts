import { Localization } from 'material-table';
import React from 'react';

export const useLocalization = (globalSearch: boolean): Localization => {
  return React.useMemo((): Localization => {
    return {
      body: {
        emptyDataSourceMessage: globalSearch
          ? `Search for a patient above by either patient id or initials. If
            nothing matches your search criteria this page will remain blank`
          : `No records to display`,
      },
    };
  }, [globalSearch]);
};
