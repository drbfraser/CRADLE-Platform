import { Patient } from '@types';
import React from 'react';
import { SexEnum } from '../../../../../enums';
import { getPrettyDateYYYYmmDD } from '../../../../../shared/utils';

interface IProps {
  patient: Patient;
}

export const BasicInformation: React.FC<IProps> = ({ patient }) => {
  return (
    <>
      <p>
        <b>ID: </b> {patient.patientId}
      </p>
      <p>
        <b>Birthday: </b>
        {patient.dob === undefined || patient.dob === null
          ? `N/A`
          : getPrettyDateYYYYmmDD(patient.dob)}
      </p>
      <p>
        <b>Age: </b>
        {patient.patientAge === undefined || patient.patientAge === null
          ? `N/A`
          : patient.patientAge}
      </p>
      <p>
        <b>Sex: </b> {patient.patientSex}
      </p>
      {patient.patientSex === SexEnum.FEMALE && (
        <p>
          <b>Pregnant: </b> {patient.isPregnant ? `Yes` : `No`}
        </p>
      )}
    </>
  );
};
