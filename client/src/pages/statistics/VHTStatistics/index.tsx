import React, { useState } from 'react';
import { useEffect } from 'react';
import { IVHT } from 'src/types';
import { Toast } from 'src/shared/components/toast';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { getAllVHT, getUserStatisticData } from '../utils';
import { StatisticDashboardWithSelect } from '../utils/StatisticDashboardWithSelect';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';

interface IProps {
  from: Date;
  to: Date;
}

export const VHTStatistics: React.FC<IProps> = ({ from, to }) => {
  const classes = useStyles();
  const [vhts, setVhts] = useState<IVHT[]>([]);
  const [vht, setVht] = useState();
  const [errorLoading, setErrorLoading] = useState(false);

  const handleChange = (event: any) => {
    setVht(event.target.value);
  };

  useEffect(() => {
    getAllVHT()
      .then((response) => {
        setVhts(response);
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
          message="Something went wrong loading VHT information. Please try again."
          clearMessage={() => setErrorLoading(false)}
        />
      )}
      <div>
        <h3>Please select a VHT from the list:</h3>

        <FormControl className={classes.formControl}>
          <Select value={vht} onChange={handleChange}>
            {vhts.map((vht, idx) => (
              <MenuItem value={vht.userId} key={idx}>
                {`${vht.firstName} (id: ${vht.userId})`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <br />
        <br />
        {vht !== undefined && (
          <StatisticDashboardWithSelect
            getData={() =>
              getUserStatisticData(
                vht,
                from.getTime() / 1000,
                to.getTime() / 1000
              )
            }
            select={vht}
            message={
              'Something went wrong loading VHT statistics. Please try again.'
            }
            from={from}
            to={to}
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
