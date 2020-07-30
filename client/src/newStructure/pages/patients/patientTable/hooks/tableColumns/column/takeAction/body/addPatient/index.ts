import React from 'react';
import { ReduxState } from '../../../../../../../../../redux/reducers';
import { useSelector } from 'react-redux';

interface IUseAddPatient {
  showAddPatientPrompt: boolean;
  hidePrompt: () => void;
  showPrompt: () => void;
}

export const useAddPatient = (): IUseAddPatient => {
  const error = useSelector(({ patients }: ReduxState): boolean => {
    return Boolean(patients.addingFromGlobalSearchError);
  });

  const [showAddPatientPrompt, setShowAddPatientPrompt] = React.useState<
    boolean
  >(false);

  const hidePrompt = React.useCallback(
    (): void => setShowAddPatientPrompt(false),
    [setShowAddPatientPrompt]
  );

  const showPrompt = (): void => setShowAddPatientPrompt(true);

  React.useEffect((): void => {
    if (error) {
      hidePrompt();
    }
  }, [error, hidePrompt]);

  return {
    showAddPatientPrompt,
    hidePrompt,
    showPrompt,
  };
};
