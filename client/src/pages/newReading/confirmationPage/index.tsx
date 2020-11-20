import { Paper, TextField } from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';

import { FormStatusEnum } from '../../../enums';
import { GESTATIONAL_AGE_UNITS } from '../patientInfoForm';
import { OrNull } from '@types';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    formField: {
      margin: theme.spacing(2),
      minWidth: '22ch',
      width: '30%',
    },
    formFieldDM: {
      margin: theme.spacing(1),
      minWidth: '48ch',
      width: '46.5%',
    },
    formControl: {
      margin: theme.spacing(3),
    },
  })
);
const getSymptomsMapping = (symptoms: any) => {
  switch (symptoms) {
    case 'none':
      return 'none';
    case 'headache':
      return 'headache';
    case 'bleeding':
      return 'bleeding';
    case 'blurredVision':
      return 'blurred vision';
    case 'feverish':
      return 'feverish';
    case 'abdominalPain':
      return 'abdominal pain';
    case 'unwell':
      return 'unwell';
    case 'cough':
      return 'cough';
    case 'shortnessBreath':
      return 'shortness of breath';
    case 'soreThroat':
      return 'sore throat';
    case 'muscleAche':
      return 'muscle ache';
    case 'fatigue':
      return 'fatigue';
    case 'lossOfSense':
      return 'loss of sense';
    case 'lossOfTaste':
      return 'loss of taste';
    case 'lossOfSmell':
      return 'loss of smell';
    default:
      return '';
  }
};
interface IProps {
  formStatus: OrNull<FormStatusEnum>;
  patient: any;
  symptoms: any;
  vitals: any;
  assessment: any;
  urineTest: any;
  isPatientExisting: any;
}

const Page: React.FC<IProps> = (props) => {
  const classes = useStyles();
  const [symptomsString, setSymptomsString] = React.useState('');

  React.useEffect((): void => {
    const patientSymptoms = Object.entries(props.symptoms).filter(
      ([_, hasSymptom]) => hasSymptom === true
    );

    let symptomsString = '';
    patientSymptoms.forEach(([key], i) => {
      const comma = i !== 0 ? ', ' : '';
      symptomsString += comma + getSymptomsMapping(key);
    });

    setSymptomsString(symptomsString);
  }, [props.symptoms]);

  return (
    <Paper
      style={{
        padding: '35px 25px',
        marginTop: '2%',
        borderRadius: '15px',
      }}>
      <h1>
        <b>Confirm Information</b>
      </h1>
      <form className={classes.root} noValidate autoComplete="off">
        {!props.isPatientExisting ||
        props.formStatus === FormStatusEnum.EDIT_PATIENT_INFORMATION ? (
          <>
            <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>
              Patient Demographics
            </h3>
            <TextField
              disabled={props.patient.patientName ? false : true}
              InputProps={{
                readOnly: props.patient.patientName ? true : false,
              }}
              label="Name"
              variant="outlined"
              value={props.patient.patientName}
            />
            <TextField
              disabled={props.patient.patientId ? false : true}
              InputProps={{
                readOnly: props.patient.patientId ? true : false,
              }}
              label="Id"
              variant="outlined"
              value={props.patient.patientId}
            />
            <TextField
              disabled={props.patient.householdNumber ? false : true}
              InputProps={{
                readOnly: props.patient.householdNumber ? true : false,
              }}
              label="Household Number"
              variant="outlined"
              value={props.patient.householdNumber}
            />
            <TextField
              disabled={props.patient.patientAge ? false : true}
              InputProps={{
                readOnly: props.patient.patientAge ? true : false,
              }}
              label="Age"
              variant="outlined"
              value={props.patient.patientAge}
            />
            <TextField
              disabled={props.patient.isPregnant ? false : true}
              InputProps={{
                readOnly: props.patient.isPregnant ? true : false,
              }}
              label="Pregnant"
              variant="outlined"
              value={props.patient.isPregnant}
            />
            <TextField
              disabled={props.patient.gestationalAgeValue ? false : true}
              InputProps={{
                readOnly: props.patient.gestationalAgeValue ? true : false,
              }}
              label="Gestational Age"
              variant="outlined"
              value={props.patient.gestationalAgeValue}
            />
            <TextField
              disabled={props.patient.gestationalAgeUnit ? false : true}
              InputProps={{
                readOnly: props.patient.gestationalAgeUnit ? true : false,
              }}
              label="Gestational Unit"
              variant="outlined"
              value={
                props.patient.gestationalAgeUnit === GESTATIONAL_AGE_UNITS.WEEKS
                  ? 'Weeks'
                  : 'Months'
              }
            />
            <TextField
              disabled={props.patient.zone ? false : true}
              InputProps={{
                readOnly: props.patient.zone ? true : false,
              }}
              label="Zone"
              variant="outlined"
              value={props.patient.zone}
            />
            <TextField
              disabled={props.patient.dob ? false : true}
              InputProps={{
                readOnly: props.patient.dob ? true : false,
              }}
              label="DOB"
              variant="outlined"
              value={props.patient.dob}
            />
            <TextField
              disabled={props.patient.villageNumber ? false : true}
              InputProps={{
                readOnly: props.patient.villageNumber ? true : false,
              }}
              label="Village Number"
              variant="outlined"
              value={props.patient.villageNumber}
            />
            <TextField
              disabled={props.patient.drugHistory ? false : true}
              InputProps={{
                readOnly: props.patient.drugHistory ? true : false,
              }}
              label="Drug History"
              variant="outlined"
              value={props.patient.drugHistory}
            />
            <TextField
              disabled={props.patient.medicalHistory ? false : true}
              InputProps={{
                readOnly: props.patient.medicalHistory ? true : false,
              }}
              label="Medical History"
              variant="outlined"
              value={props.patient.medicalHistory}
            />
          </>
        ) : (
          ''
        )}
        {props.formStatus !== FormStatusEnum.EDIT_PATIENT_INFORMATION &&
          props.formStatus !== FormStatusEnum.ADD_ASSESSMENT &&
          props.formStatus !== FormStatusEnum.UPDATE_ASSESSMENT && (
            <>
              <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Symptoms</h3>
              <TextField
                disabled={symptomsString ? false : true}
                InputProps={{
                  readOnly: symptomsString ? true : false,
                }}
                className={classes.formFieldDM}
                multiline
                rows={4}
                label="Symptoms"
                variant="outlined"
                value={symptomsString}
              />
              <TextField
                disabled={props.symptoms.otherSymptoms ? false : true}
                InputProps={{
                  readOnly: props.symptoms.otherSymptoms ? true : false,
                }}
                className={classes.formFieldDM}
                multiline
                rows={4}
                label="Other Symptoms"
                variant="outlined"
                value={props.symptoms.otherSymptoms}
              />

              <h3
                style={{
                  color: '#9E9E9E',
                  fontSize: '18px',
                  width: '51ch',
                  display: 'inline',
                  float: 'left',
                }}>
                Vitals
              </h3>
              <h3
                style={{
                  color: '#9E9E9E',
                  fontSize: '18px',
                  width: '45%',
                  display: 'inline',
                  float: 'left',
                }}>
                Urine Test
              </h3>
              <TextField
                disabled={props.vitals.bpSystolic ? false : true}
                InputProps={{
                  readOnly: props.vitals.bpSystolic ? true : false,
                }}
                className={classes.formFieldDM}
                label="Systolic"
                variant="outlined"
                value={props.vitals.bpSystolic}
              />
              <TextField
                disabled={props.urineTest.leukocytes ? false : true}
                InputProps={{
                  readOnly: props.urineTest.leukocytes ? true : false,
                }}
                className={classes.formFieldDM}
                label="Leukocytes"
                variant="outlined"
                value={props.urineTest.leukocytes}
              />
              <TextField
                disabled={props.vitals.bpDiastolic ? false : true}
                InputProps={{
                  readOnly: props.vitals.bpDiastolic ? true : false,
                }}
                className={classes.formFieldDM}
                label="Diastolic"
                variant="outlined"
                value={props.vitals.bpDiastolic}
              />
              <TextField
                disabled={props.urineTest.blood ? false : true}
                InputProps={{
                  readOnly: props.urineTest.blood ? true : false,
                }}
                className={classes.formFieldDM}
                label="Blood"
                variant="outlined"
                value={props.urineTest.blood}
              />
              <TextField
                disabled={props.vitals.heartRateBPM ? false : true}
                InputProps={{
                  readOnly: props.vitals.heartRateBPM ? true : false,
                }}
                className={classes.formFieldDM}
                label="Heart Rate"
                variant="outlined"
                value={props.vitals.heartRateBPM}
              />
              <TextField
                disabled={props.urineTest.protein ? false : true}
                InputProps={{
                  readOnly: props.urineTest.protein ? true : false,
                }}
                className={classes.formFieldDM}
                label="Protein"
                variant="outlined"
                value={props.urineTest.protein}
              />
              <TextField
                disabled={props.vitals.respiratoryRate ? false : true}
                InputProps={{
                  readOnly: props.vitals.respiratoryRate ? true : false,
                }}
                className={classes.formFieldDM}
                label="Respiratory Rate"
                variant="outlined"
                value={props.vitals.respiratoryRate}
              />
              <TextField
                disabled={props.urineTest.glucose ? false : true}
                InputProps={{
                  readOnly: props.urineTest.glucose ? true : false,
                }}
                className={classes.formFieldDM}
                label="Glucose"
                variant="outlined"
                value={props.urineTest.glucose}
              />
              <TextField
                disabled={props.vitals.oxygenSaturation ? false : true}
                InputProps={{
                  readOnly: props.vitals.oxygenSaturation ? true : false,
                }}
                className={classes.formFieldDM}
                label="Oxygen Saturation"
                variant="outlined"
                value={props.vitals.oxygenSaturation}
              />
              <TextField
                disabled={props.urineTest.nitrites ? false : true}
                InputProps={{
                  readOnly: props.urineTest.nitrites ? true : false,
                }}
                className={classes.formFieldDM}
                label="Nitrites"
                variant="outlined"
                value={props.urineTest.nitrites}
              />
              <TextField
                disabled={props.vitals.temperature ? false : true}
                InputProps={{
                  readOnly: props.vitals.temperature ? true : false,
                }}
                className={classes.formFieldDM}
                label="Temperature"
                variant="outlined"
                value={props.vitals.temperature}
              />
            </>
          )}
        {props.formStatus !== FormStatusEnum.EDIT_PATIENT_INFORMATION && (
          <>
            <h3 style={{ color: '#9E9E9E', fontSize: '18px' }}>Assessment</h3>
            <TextField
              disabled={props.assessment.specialInvestigations ? false : true}
              InputProps={{
                readOnly: props.assessment.specialInvestigations ? true : false,
              }}
              className={classes.formFieldDM}
              multiline
              rows={3}
              label="Special Investigations"
              variant="outlined"
              value={props.assessment.specialInvestigations}
            />
            <TextField
              disabled={props.assessment.finalDiagnosis ? false : true}
              InputProps={{
                readOnly: props.assessment.finalDiagnosis ? true : false,
              }}
              className={classes.formFieldDM}
              multiline
              rows={3}
              label="Final Diagnosis"
              variant="outlined"
              value={props.assessment.finalDiagnosis}
            />
            <TextField
              disabled={props.assessment.treatmentOP ? false : true}
              InputProps={{
                readOnly: props.assessment.treatmentOP ? true : false,
              }}
              className={classes.formFieldDM}
              multiline
              rows={3}
              label="Treatment/Operation"
              variant="outlined"
              value={props.assessment.treatmentOP}
            />
            <TextField
              disabled={props.assessment.medPrescribed ? false : true}
              InputProps={{
                readOnly: props.assessment.medPrescribed ? true : false,
              }}
              className={classes.formFieldDM}
              multiline
              rows={3}
              label="Medication Prescribed"
              variant="outlined"
              value={props.assessment.medPrescribed}
            />
            <TextField
              disabled={props.assessment.InstructionFollow ? false : true}
              InputProps={{
                readOnly: props.assessment.InstructionFollow ? true : false,
              }}
              className={classes.formFieldDM}
              multiline
              rows={3}
              label="Instruction for Follow-up"
              variant="outlined"
              value={props.assessment.InstructionFollow}
            />
          </>
        )}{' '}
      </form>
    </Paper>
  );
};

export const ConfirmationPage = Page;
