import React, { useState } from 'react';
import { useEffect } from 'react';
import { IFacility } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import { StatisticDashboardWithSelect } from '../utils/StatisticDashboardWithSelect';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { getAllFacilities } from '../utils';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { Moment } from 'moment';
import { EndpointEnum } from 'src/server';
import { BASE_URL } from 'src/server/utils';

interface IProps {
  from: Moment | null;
  to: Moment | null;
}

export const FacilityStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStyles();
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [facility, setFacility] = useState('');
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setFacility(event.target.value);
  };

  useEffect(() => {
    getAllFacilities()
      .then((response) => {
        setFacilities(response);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, []);

  return (
    <div>
      {errorLoading && (
        <Toast
          status="error"
          message="Something went wrong loading health care facilities. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <div>
        <h3>Please select a facility from the list:</h3>

        <FormControl className={classes.formControl}>
          <Select value={facility} onChange={handleChange} labelWidth={20}>
            {facilities.map((f, idx) => (
              <MenuItem value={f.healthFacilityName} key={idx}>
                {`${f.healthFacilityName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <br />
        <br />
        {facility !== '' && (
          <StatisticDashboardWithSelect
            url={
              BASE_URL +
              EndpointEnum.STATS_FACILITY +
              `/${facility}?from=${from!.toDate().getTime() / 1000}&to=${
                to!.toDate().getTime() / 1000
              }`
            }
            select={facility}
          />
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
}));
