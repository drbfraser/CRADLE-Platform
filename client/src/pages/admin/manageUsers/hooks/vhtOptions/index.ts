import { OrNull, VHT } from 'src/types';
import { useDispatch, useSelector } from 'react-redux';

import { AutocompleteOption } from 'src/shared/components/input/autocomplete/utils';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { getVhts } from 'src/redux/reducers/user/allVhts';

export const useVHTOptions = (): Array<AutocompleteOption<string, number>> => {
  const vhts = useSelector(
    ({ user }: ReduxState): OrNull<Array<VHT>> => user.allVhts.data
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!vhts) {
      dispatch(getVhts());
    }
  }, [dispatch, vhts]);

  return (
    vhts?.map(
      (vht: VHT): AutocompleteOption<string, number> => ({
        label: vht.email,
        value: vht.id,
      })
    ) ?? []
  );
};
