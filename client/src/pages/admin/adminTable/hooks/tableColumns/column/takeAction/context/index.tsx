import { AutocompleteOption } from '../../../../../../../../shared/components/input/autocomplete/utils';
import React from 'react';

export interface ITakeActionContext {
  healthFacilityOptions: Array<AutocompleteOption<string, string>>;
  vhtOptions: Array<AutocompleteOption<string, number>>;
}

export const TakeActionContext = React.createContext<
  Partial<ITakeActionContext>
>({});

export const TakeActionContextProvider: React.FC<ITakeActionContext> = ({
  children,
  healthFacilityOptions,
  vhtOptions,
}) => {
  return (
    <TakeActionContext.Provider value={{ healthFacilityOptions, vhtOptions }}>
      {children}
    </TakeActionContext.Provider>
  );
};
