import { Patient } from '@types';
import React from 'react';
import { SexEnum } from '../../../../../enums';
import { getAgeBasedOnDOB } from '../../../../../shared/utils';

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
        <b>Age: </b>
        {patient.dob === undefined || patient.dob === null
          ? `N/A`
          : getAgeBasedOnDOB(patient.dob)}
      </p>
      <p>
        <b>Village: </b> {patient.villageNumber}
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
