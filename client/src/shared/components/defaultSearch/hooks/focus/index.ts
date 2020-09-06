import React from 'react';

export const useSearchFocus = (
  globalSearch: boolean
): React.RefObject<HTMLInputElement> => {
  const search = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    if (globalSearch) {
      search.current?.focus();
    }
  }, [globalSearch]);

  return search;
};
