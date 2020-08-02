import { useDispatch, useSelector } from 'react-redux';

import { OrNull } from '@types';
import React from 'react';
import { ReduxState } from '../../../../../../../../../../../../redux/reducers';
import { getHealthFacilityList } from '../../../../../../../../../../../../redux/reducers/healthFacilities';

interface IUseHealthFacilityOptions {
  key: string;
  text: string;
  value: string;
}

export const useHealthFacilityOptions = (): Array<
  IUseHealthFacilityOptions
> => {
  const healthFacilities = useSelector(
    ({ healthFacilities }: ReduxState): OrNull<Array<any>> =>
      healthFacilities.data
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    if (!healthFacilities) {
      dispatch(getHealthFacilityList());
    }
  }, [dispatch, healthFacilities]);

  return (
    healthFacilities?.map(
      (healthFacility: string): IUseHealthFacilityOptions => ({
        key: healthFacility,
        text: healthFacility,
        value: healthFacility,
      })
    ) ?? []
  );
};
