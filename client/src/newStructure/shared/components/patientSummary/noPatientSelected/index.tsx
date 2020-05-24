import React from 'react';
import { Button } from 'semantic-ui-react';


interface IProps {
  goBackToPatientsPage: () => void;
};

export const NoPatientSelected: React.FC<IProps> = ({ 
  goBackToPatientsPage 
}) => (
  <>
    <Button onClick={goBackToPatientsPage}>Back</Button>
    <h2>No patient selected</h2>
  </>
);
