import React from 'react';

interface IUseAddPatient {
  showAddPatientPrompt: boolean;
  hidePrompt: () => void;
  showPrompt: () => void;
}

export const useAddPatient = (): IUseAddPatient => {
  const [showAddPatientPrompt, setShowAddPatientPrompt] = React.useState<
    boolean
  >(false);

  const hidePrompt = (): void => setShowAddPatientPrompt(false);

  const showPrompt = (): void => setShowAddPatientPrompt(true);

  return {
    showAddPatientPrompt,
    hidePrompt,
    showPrompt,
  };
};
