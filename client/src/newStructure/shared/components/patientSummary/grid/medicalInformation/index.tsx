import React from 'react';
import { Button, Icon, Divider } from 'semantic-ui-react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { getPrettyDate, GESTATIONAL_AGE_UNITS } from '../../../../utils';
import classes from './styles.module.css';

interface IProps {
  gridClass: string;
  iconClass: string;
  paperClass: string;
  selectedPatient: any;
  setState: any;
};

export const MedicalInformation: React.FC<IProps> = ({ 
  gridClass, 
  iconClass,
  paperClass, 
  selectedPatient, 
  setState, 
}) => {
  const openPatientModal = (): void =>
    setState((currentState: any): any => ({
      ...currentState,
      displayPatientModal: true,
      selectedPatientCopy: { ...currentState.selectedPatient },
    }));

  return (
    <Grid className={ gridClass } item={ true } xs={ 6 }>
      <Paper className={ paperClass }>
        <Typography variant="h5" component="h3">
          <Icon
            className={ iconClass }
            name="address card outline"
            size="large"
          />
          Medical Information
        </Typography>
        <Divider />
        <div className={ classes.content }>
          <p>
            <span className={ classes.bold }>Patient ID:</span>{ ` ` }
            { selectedPatient.patientId }
          </p>
          <p>
            <span className={ classes.bold }>Patient Birthday: </span>{ ` ` }
            { selectedPatient.dob === undefined ||
              selectedPatient.dob === null
              ? `N/A`
              : getPrettyDate(selectedPatient.dob) }
          </p>
          <p>
            <span className={ classes.bold }>Patient Age: </span>{ ` ` }
            { selectedPatient.patientAge === undefined ||
              selectedPatient.patientAge === null
              ? `N/A`
              : selectedPatient.patientAge }
          </p>
          <p>
            <span className={ classes.bold }>Patient Sex: </span>{ ` ` }
            { selectedPatient.patientSex }
          </p>
          { selectedPatient.patientSex === `FEMALE` && (
            <p>
              <span className={ classes.bold }>Pregnant: </span>{ ` ` }
              { selectedPatient.isPregnant ? `Yes` : `No` }
            </p>
          ) }
          { selectedPatient.isPregnant &&
            selectedPatient.gestationalAgeValue && (
              <p>
                <span className={ classes.bold }>Gestational Age: </span>{ ` ` }
                { selectedPatient.gestationalAgeValue }
                { selectedPatient.gestationalAgeUnit ===
                  GESTATIONAL_AGE_UNITS.WEEKS
                  ? `week(s)`
                  : `month(s)` }
              </p>
            ) }
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={ <Icon name="chevron down" /> }
              aria-controls="panel1a-content"
              id="panel1a-header">
              <Typography>Drug History</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                { selectedPatient.drugHistory }
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={ <Icon name="chevron down" /> }
              aria-controls="panel1a-content"
              id="panel1a-header">
              <Typography>Medical History</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography>
                { selectedPatient.medicalHistory }
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Divider />
          <Button onClick={ openPatientModal }>
            Edit Patient
          </Button>
        </div>
      </Paper>
    </Grid>
  );
};
