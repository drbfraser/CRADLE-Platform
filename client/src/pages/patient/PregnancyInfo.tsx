import { Paper, Typography, Divider, Box, TableBody } from '@material-ui/core';
import { Form, Select, InputOnChangeData } from 'semantic-ui-react';
import { useHistory, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Alert, Skeleton } from '@material-ui/lab';
import PregnantWomanIcon from '@material-ui/icons/PregnantWoman';
import React, { useState, useEffect } from 'react';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';
import { PatientPregnancyInfo } from 'src/shared/types';
import { RedirectButton } from 'src/shared/components/redirectButton';
import TableRow from '@material-ui/core/TableRow';
import Table from '@material-ui/core/Table';
import {
  gestationalAgeUnitLabels,
  gestationalAgeUnitFormatters,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric, getYearToDisplay } from 'src/shared/utils';
interface IProps {
  patientId: string;
  patientName: string;
}

export const PregnancyInfo = ({ patientId, patientName }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const [currentPregnancyUnit, setCurrentPregnancyUnit] = useState(
    GestationalAgeUnitEnum.WEEKS
  );
  const [previousPregnancyUnit, setPreviousPregnancyUnit] = useState(
    GestationalAgeUnitEnum.MONTHS
  );

  const [info, setInfo] = useState<PatientPregnancyInfo>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}` +
        EndpointEnum.PREGNANCY_SUMMARY
    )
      .then((resp) => resp.json())
      .then((info) => {
        setInfo(info);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  const handleClick = (pregnancyId: string) => {
    history.push(`/patients/${patientId}/edit/pregnancyInfo/${pregnancyId}`);
  };

  const unitOptions = Object.values(GestationalAgeUnitEnum).map((unit) => ({
    key: unit,
    text: gestationalAgeUnitLabels[unit],
    value: unit,
  }));

  const handleCurrentPregnancyUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setCurrentPregnancyUnit(value as GestationalAgeUnitEnum);
  };

  const handlePreviousPregnancyUnitChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { value }: InputOnChangeData
  ) => {
    setPreviousPregnancyUnit(value as GestationalAgeUnitEnum);
  };

  const CurrentPregnancyStatus = () => {
    const status = info!.isPregnant ? 'Yes' : 'No';

    let hasTimedOut = false;
    if (info!.isPregnant) {
      hasTimedOut = getNumOfWeeksNumeric(info!.pregnancyStartDate) > 40;
    }

    const GestationalAge = () => {
      return (
        <div>
          <p>
            <b>Gestational Age: </b>
            <span style={hasTimedOut ? { color: 'red' } : {}}>
              {gestationalAgeUnitFormatters[currentPregnancyUnit](
                info!.pregnancyStartDate,
                null
              )}
            </span>
          </p>
          <br />
        </div>
      );
    };

    return (
      <div>
        {info!.isPregnant ? (
          <RedirectButton
            text="Edit/Close"
            redirectUrl={`/patients/${patientId}/edit/pregnancyInfo/${
              info!.pregnancyId
            }`}
          />
        ) : (
          <RedirectButton
            text="Add"
            redirectUrl={`/pregnancies/new/${patientId}`}
          />
        )}
        <h4>Current Pregnancy</h4>
        <Form.Field
          name="gestationalAgeUnits"
          control={Select}
          options={unitOptions}
          placeholder={gestationalAgeUnitLabels[currentPregnancyUnit]}
          onChange={handleCurrentPregnancyUnitChange}
          className={classes.margin}
        />
        <br />
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {info?.isPregnant && <GestationalAge />}
        {hasTimedOut && (
          <Alert severity="warning">Is the patient still pregnant?</Alert>
        )}
        {!info?.isPregnant && <br />}
      </div>
    );
  };

  return (
    <Paper className={classes.wrapper}>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <PregnantWomanIcon fontSize="large" /> Pregnancy Information
          <Link
            to={
              '/history/' + patientId + '/' + patientName + '/' + SexEnum.FEMALE
            }
            className={classes.smallLink}>
            View Past Records
          </Link>
        </Typography>
        <Divider />
        {errorLoading ? (
          <Alert severity="error">
            Something went wrong trying to load patient&rsquo;s pregnancy
            status. Please try refreshing.
          </Alert>
        ) : info ? (
          <>
            <CurrentPregnancyStatus />
            <Divider />
            <div>
              <div>
                <RedirectButton
                  text="Add"
                  redirectUrl={`/pregnancies/new/${patientId}`}
                />
                <h4> Previous Obstetric History</h4>
              </div>
              <Form.Field
                name="gestationalAgeUnits"
                control={Select}
                options={unitOptions}
                placeholder={gestationalAgeUnitLabels[previousPregnancyUnit]}
                onChange={handlePreviousPregnancyUnitChange}
                className={classes.margin}
              />
              <br />
              <Table className={classes.table}>
                <TableBody>
                  {info.pastPregnancies && info.pastPregnancies.length > 0 ? (
                    info.pastPregnancies.map((pastPregnancy, index) => (
                      <TableRow
                        hover={true}
                        key={index}
                        onClick={() => handleClick(pastPregnancy.pregnancyId)}>
                        {getYearToDisplay(pastPregnancy.pregnancyEndDate)} -
                        Baby born at{' '}
                        {gestationalAgeUnitFormatters[
                          previousPregnancyUnit ?? GestationalAgeUnitEnum.WEEKS
                        ](
                          pastPregnancy.pregnancyStartDate,
                          pastPregnancy.pregnancyEndDate
                        )}{' '}
                        - {pastPregnancy.pregnancyOutcome ?? 'N/A'}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>No previous pregnancy records</TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <Skeleton variant="rect" height={200} />
        )}
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles({
  margin: {
    marginTop: 15,
  },
  wrapper: {
    backgroundColor: '#fff',
  },
  table: {
    clear: 'right',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
  smallLink: {
    float: 'right',
    fontSize: 14,
  },
});
