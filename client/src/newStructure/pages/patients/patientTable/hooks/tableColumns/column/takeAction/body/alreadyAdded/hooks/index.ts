import React from 'react';

interface IUseAlreadyAddedPatient {
  showAlreadyAdded: boolean;
  onClose: () => void;
  onAlreadyAdded: () => void;
}

export const useAlreadyAddedPatient = (): IUseAlreadyAddedPatient => {
  const [showAlreadyAdded, setShowAlreadyAdded] = React.useState<boolean>(
    false
  );

  const onClose = (): void => setShowAlreadyAdded(false);

  const onAlreadyAdded = (): void => setShowAlreadyAdded(true);

  return {
    showAlreadyAdded,
    onClose,
    onAlreadyAdded,
  };
};
