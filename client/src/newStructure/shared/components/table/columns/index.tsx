import { GlobalSearchPatient, Patient } from '@types';
import { getLatestReading, getTrafficIcon } from '../../../utils';

import { Column } from 'material-table';
import React from 'react';
import { TextAlignProperty } from 'csstype';
import { TrafficLightEnum } from '../../../../enums';
import classes from './styles.module.css';

export const initials: Column<Patient | GlobalSearchPatient> = {
  title: `Patient Initials`,
  field: `patientName`,
  searchable: true,
  render: (rowData: Patient | GlobalSearchPatient): JSX.Element => (
    <p className={classes.text}>{rowData.patientName}</p>
  ),
  headerStyle: {
    textAlign: `center` as TextAlignProperty,
  },
};

export const patientId: Column<Patient | GlobalSearchPatient> = {
  title: `Patient ID`,
  field: `patientId`,
  customSort: (
    patient: Patient | GlobalSearchPatient,
    otherPatient: Patient | GlobalSearchPatient
  ) => Number(patient.patientId) - Number(otherPatient.patientId),
  searchable: true,
};

export const village: Column<Patient | GlobalSearchPatient> = {
  title: `Village`,
  field: `villageNumber`,
  searchable: false,
};

export const vitalSign: Column<Patient | GlobalSearchPatient> = {
  title: `Vital Sign`,
  cellStyle: {
    padding: `0px`,
  },
  render: (rowData: Patient | GlobalSearchPatient) =>
    getTrafficIcon(getLatestReading(rowData.readings).trafficLightStatus),
  customSort: (
    patient: Patient | GlobalSearchPatient,
    otherPatient: Patient | GlobalSearchPatient
  ) => {
    const leftIndex = Object.values(TrafficLightEnum).indexOf(
      patient.readings[0].trafficLightStatus
    );
    const rightIndex = Object.values(TrafficLightEnum).indexOf(
      otherPatient.readings[0].trafficLightStatus
    );

    return rightIndex - leftIndex;
  },
  searchable: false,
};
