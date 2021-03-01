import { Patient } from 'src/types';
import React from 'react';
import { SexEnum } from 'src/enums';

interface IProps {
  patient: Patient;
}

export const BasicInformation: React.FC<IProps> = ({ patient }) => {
  return (
    <>
      {patient.patientSex === SexEnum.FEMALE && (
        <p>
          <b>Pregnant: </b> {patient.isPregnant ? `Yes` : `No`}
        </p>
      )}
    </>
  );
};
