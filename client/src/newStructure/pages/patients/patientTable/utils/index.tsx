import { Column } from 'material-table';
import { Patient } from '@types';
import { TextAlignProperty } from 'csstype';
import {
  getLatestReading,
  getTrafficIcon,
  getLatestReadingDateTime,
  getPrettyDate,
  sortPatientsByLastReading,
} from '../../../../shared/utils';
import { TrafficLightEnum } from '@enums';
import React from 'react';


export const initials: Column<Patient> = {
  title: `Patient Initials`,
  field: `patientName`,
  render: (rowData: Patient): JSX.Element => (
    <p
      style={ {
        fontSize: `200%`,
        fontWeight: `bold`,
        textAlign: `center`
      } }>
      { rowData.patientName }
    </p>
  ),
  headerStyle: {
    textAlign: `center` as TextAlignProperty
  }
};

export const patientId: Column<Patient> = {
  title: `Patient ID`,
  field: `patientId`,
  customSort: (patient: Patient, otherPatient: Patient) =>
    Number(patient.patientId) - Number(otherPatient.patientId)
};

export const village: Column<Patient> = {
  title: `Village`,
  field: `villageNumber`,
};

export const vitalSign: Column<Patient> = {
  title: `Vital Sign`,
  cellStyle: {
    padding: `0px`
  },
  render: (rowData: Patient) =>
    getTrafficIcon(
      getLatestReading(rowData.readings).trafficLightStatus
    ),
  customSort: (patient: Patient, otherPatient: Patient) => {
    const leftIndex = Object.values(TrafficLightEnum).indexOf(
      patient.readings[0].trafficLightStatus
    );
    const rightIndex = Object.values(TrafficLightEnum).indexOf(
      otherPatient.readings[0].trafficLightStatus
    );

    return leftIndex - rightIndex;
  }
};

export const lastReadingDate = {
  title: `Date of Last Reading`,
  field: `lastReading`,
  render: (rowData: Patient) => (
    <p>{ getPrettyDate(getLatestReadingDateTime(rowData.readings)) }</p>
  ),
  customSort: (patient: Patient, otherPatient: Patient) =>
    sortPatientsByLastReading(patient, otherPatient),
  defaultSort: `asc` as `asc`
};