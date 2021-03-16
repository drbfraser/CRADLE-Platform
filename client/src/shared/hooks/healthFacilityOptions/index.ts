import { HealthFacility, OrNull } from 'src/types';
import { useDispatch, useSelector } from 'react-redux';

import { AutocompleteOption } from 'src/shared/components/input/autocomplete/utils';
import React from 'react';
import { ReduxState } from 'src/redux/reducers';
import { getHealthFacilityList } from 'src/redux/reducers/healthFacilities';

export const useHealthFacilityOptions = (): Array<
  AutocompleteOption<string, string>
> => {
  const healthFacilities = useSelector(
    ({ healthFacilities }: ReduxState): OrNull<Array<HealthFacility>> =>
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
      (healthFacility: string): AutocompleteOption<string, string> => ({
        label: healthFacility,
        value: healthFacility,
      })
    ) ?? []
  );
};
