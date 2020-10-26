import { DialogPopup } from '../../../shared/components/dialogPopup';
import React from 'react';

interface IProps {
  open: boolean;
  handleDialogClose: any;
  patientExist: boolean;
  patient: any;
}

export default function AlertDialog(props: IProps) {
  return (
    <DialogPopup
      open={props.open}
      onClose={props.handleDialogClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      content={
        <>
          {props.patientExist
            ? `Would you like to use the patient with `
            : `To create a new patient, press continue.`}
          {props.patientExist ? (
            <div>
              {`Patient ID: `}
              {props.patient.patientId}
              {` `}
            </div>
          ) : (
            ``
          )}
          {props.patientExist ? (
            <div>
              {`Patient Name: `}
              {props.patient.patientName}
              {` `}
            </div>
          ) : (
            ``
          )}
          {props.patientExist ? (
            <div>
              {`Patient Sex: `}
              {props.patient.patientSex}
            </div>
          ) : (
            ``
          )}
        </>
      }
      title={
        props.patientExist
          ? `Patient ID already exists`
          : `Patient ID does not exist`
      }
      primaryAction={{
        children: props.patientExist ? `Yes` : `Continue`,
        value: props.patientExist ? `yes` : `ok`,
        onClick: props.handleDialogClose,
      }}
      secondaryAction={
        props.patientExist
          ? {
              children: `No`,
              value: `no`,
              onClick: props.handleDialogClose,
            }
          : {
              children: `Cancel`,
              value: `no`,
              onClick: props.handleDialogClose,
            }
      }
    />
  );
}
