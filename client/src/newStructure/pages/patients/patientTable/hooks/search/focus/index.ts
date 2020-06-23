import React from 'react';

export const useSearchFocus = (globalSearch: boolean): void => {
  React.useEffect((): void => {
    if (globalSearch) {
      // Accessing the dom directly to focus on the search field when global search is toggled
      // This is because material-table does not expose a way of doing this directly
      const search = document.getElementsByClassName(
        `MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputAdornedStart MuiOutlinedInput-inputAdornedStart MuiInputBase-inputAdornedEnd MuiOutlinedInput-inputAdornedEnd`
      )[0];
      (search as HTMLInputElement).focus();
    }
  }, [globalSearch]);
};
