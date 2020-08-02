import { OrNull, VHT } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import React from 'react';
import { ReduxState } from '../../../../../../../../../../../../redux/reducers';
import { getVhts } from '../../../../../../../../../../../../redux/reducers/user/allVhts';

export interface IUseVHTOptions {
  key: number;
  text: string;
  value: number;
}

export const useVHTOptions = (): Array<IUseVHTOptions> => {
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
      (vht: VHT): IUseVHTOptions => ({
        key: vht.id,
        text: vht.email,
        value: vht.id,
      })
    ) ?? []
  );
};
