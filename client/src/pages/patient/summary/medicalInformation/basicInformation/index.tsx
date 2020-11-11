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
        <b>Sex: </b> {patient.patientSex}
      </p>
      <p>
      <table style={{width: 300}}>
  <tr>
    <td colSpan={2}>Village: {patient.villageNumber ? patient.villageNumber:'N/A'}</td>
  </tr>
  <tr>
    <td>Zone: {patient.zone ? patient.zone:'N/A'}</td>
    <td>Household: {patient.householdNumber ? patient.householdNumber:'N/A'}</td>
  </tr>
</table>
</p>
      {patient.patientSex === SexEnum.FEMALE && (
        <p>
          <b>Pregnant: </b> {patient.isPregnant ? `Yes` : `No`}
        </p>
      )}
    </>
  );
};
