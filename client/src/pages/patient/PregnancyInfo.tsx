import { API_URL, apiFetch } from 'src/shared/api';
import { Alert, Skeleton } from '@material-ui/lab';
import { Box, Divider, Paper, TableBody, Typography } from '@material-ui/core';
import {
  EndpointEnum,
  GestationalAgeUnitEnum,
  SexEnum,
} from 'src/shared/enums';
import { Form, InputOnChangeData, Select, TableCell } from 'semantic-ui-react';
import { Link, useHistory } from 'react-router-dom';
import { PastPregnancy, PatientPregnancyInfo } from 'src/shared/types';
import React, { useEffect, useState } from 'react';
import {
  gestationalAgeUnitFormatters,
  gestationalAgeUnitLabels,
} from 'src/shared/constants';
import { getNumOfWeeksNumeric, getYearToDisplay } from 'src/shared/utils';

import PregnantWomanIcon from '@material-ui/icons/PregnantWoman';
import { RedirectButton } from 'src/shared/components/redirectButton';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';

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
    const url = `${API_URL}${EndpointEnum.PATIENTS}/${patientId}${EndpointEnum.PREGNANCY_SUMMARY}`;

    apiFetch(url)
      .then((resp) => resp.json())
      .then((info) => setInfo(info))
      .catch(() => setErrorLoading(true));
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

    const isOverdue = info!.isPregnant
      ? getNumOfWeeksNumeric(info!.pregnancyStartDate) > 40
      : false;

    const GestationalAge = () => {
      return (
        <div>
          <p>
            <b>Gestational Age: </b>
            <span style={isOverdue ? { color: 'red' } : {}}>
              {gestationalAgeUnitFormatters[currentPregnancyUnit](
                info!.pregnancyStartDate,
                null
              )}
            </span>
          </p>
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
        <p>
          <b>Pregnant: </b> {status}
        </p>
        {info?.isPregnant && (
          <>
            <GestationalAge />
            <br />
            <div className={classes.inline}>
              <b>Gestational Age Unit View: </b>
              <Form.Field
                name="gestationalAgeUnits"
                control={Select}
                options={unitOptions}
                placeholder={gestationalAgeUnitLabels[currentPregnancyUnit]}
                onChange={handleCurrentPregnancyUnitChange}
                className={classes.marginLeft}
              />
            </div>
            <br />
          </>
        )}
        {isOverdue && (
          <>
            <Alert severity="warning">
              Long term pregnancy of the patient detected
            </Alert>
            <br />
          </>
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
              <br />
              <Table className={classes.table}>
                <TableBody>
                  {info.pastPregnancies && info.pastPregnancies.length > 0 ? (
                    info.pastPregnancies.map(
                      (pastPregnancy: PastPregnancy, index) => (
                        <TableRow
                          hover={true}
                          key={pastPregnancy.pregnancyId}
                          onClick={() =>
                            handleClick(pastPregnancy.pregnancyId)
                          }>
                          <TableCell>
                            {getYearToDisplay(pastPregnancy.pregnancyEndDate)} -
                            Pregnancy carried to
                            {gestationalAgeUnitFormatters[
                              previousPregnancyUnit ??
                                GestationalAgeUnitEnum.WEEKS
                            ](
                              pastPregnancy.pregnancyStartDate,
                              pastPregnancy.pregnancyEndDate
                            )}{' '}
                            - {pastPregnancy.pregnancyOutcome ?? 'N/A'}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  ) : (
                    <TableRow>No previous pregnancy records</TableRow>
                  )}
                </TableBody>
              </Table>
              {info.pastPregnancies && info.pastPregnancies.length > 0 && (
                <div>
                  <br />
                  <div className={classes.inline}>
                    <b>Gestational Age Unit View: </b>
                    <Form.Field
                      name="gestationalAgeUnits"
                      control={Select}
                      options={unitOptions}
                      placeholder={
                        gestationalAgeUnitLabels[previousPregnancyUnit]
                      }
                      onChange={handlePreviousPregnancyUnitChange}
                      className={classes.marginLeft}
                    />
                  </div>
                </div>
              )}
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
  marginLeft: {
    marginLeft: 5,
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
  inline: {
    display: 'flex',
    flexDirection: 'row',
  },
});
