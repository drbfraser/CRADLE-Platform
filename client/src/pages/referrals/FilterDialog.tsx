import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import moment, { Moment } from 'moment';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DateRangePicker, FocusedInputShape } from 'react-dates';
import { makeStyles } from '@material-ui/core/styles';
import { IFacility, ReferralFilter, Referrer } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { TextField } from '@material-ui/core';

interface IProps {
  open: boolean;
  filter: ReferralFilter;
  isTransformed: boolean;
  onClose: () => void;
  setFilter: React.Dispatch<React.SetStateAction<ReferralFilter>>;
}

export const FilterDialog = ({
  open,
  filter,
  isTransformed,
  onClose,
  setFilter,
}: IProps) => {
  const classes = useStyles();

  const [selectedHealthFacility, setSelectedHealthFacility] =
    useState<IFacility>();
  const [healthFacilities, setHealthFacilities] = useState<IFacility[]>([]);

  const [startDate, setStartDate] = useState<Moment | null>(
    moment().startOf('day').subtract(29, 'days')
  );
  const [endDate, setEndDate] = useState<Moment | null>(moment().endOf('day'));
  const [presetDateRange, setPresetDateRange] = useState();
  const [focusedInput, setFocusedInput] =
    useState<FocusedInputShape | null>(null);

  const [selectedReferrer, setSelectedReferrer] = useState<Referrer>();
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  useEffect(() => {
    apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES)
      .then((resp) => resp.json())
      .then((jsonResp) => {
        setHealthFacilities(jsonResp);
      })
      .catch((error) => {
        console.error(error);
      });
    apiFetch(API_URL + EndpointEnum.USER_VHTS)
      .then((resp) => resp.json())
      .then((jsonResp) => {
        setReferrers(jsonResp);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleChange = (event: any) => {
    setPresetDateRange(event.target.value);
  };

  const setDateRange = (start: number, end: number) => {
    setStartDate(moment().startOf('day').subtract(start, 'days'));
    setEndDate(moment().endOf('day').subtract(end, 'days'));
  };
  const handleFocusChange = (arg: FocusedInputShape | null) => {
    setFocusedInput(arg);
  };

  const onFacilitySelect = (_event: any, value: IFacility) => {
    if (!value) {
      return;
    }
    setSelectedHealthFacility(value);
  };

  const onReferrerSelect = (_event: any, value: Referrer) => {
    if (!value) {
      return;
    }
    setSelectedReferrer(value);
  };

  const onConfirm = () => {
    setFilter({
      ...filter,
      healthFacilityName: selectedHealthFacility
        ? selectedHealthFacility.healthFacilityName
        : '',
      dateRange:
        startDate && endDate
          ? `${startDate.toDate().getTime() / 1000}:${
              endDate.toDate().getTime() / 1000
            }`
          : '',
      referrer: selectedReferrer ? selectedReferrer.userId : '',
    });
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={isTransformed ? 'md' : 'sm'}
      onClose={onClose}
      aria-labelledby="filter-dialog">
      <DialogTitle id="filter-dialog">Advanced Search</DialogTitle>
      <DialogContent className={classes.content}>
        <Autocomplete
          id="facility-select"
          onChange={onFacilitySelect}
          options={healthFacilities}
          getOptionLabel={(facility) => facility.healthFacilityName}
          renderInput={(params) => (
            <TextField {...params} label="Search Facility" variant="outlined" />
          )}
        />

        <Grid item>
          <DateRangePicker
            regular={true}
            startDate={startDate}
            startDateId="startDate"
            endDate={endDate}
            endDateId="endDate"
            onDatesChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            readOnly
            orientation={isTransformed ? 'horizontal' : 'vertical'}
            focusedInput={focusedInput}
            onFocusChange={handleFocusChange}
            isOutsideRange={() => false}
          />
        </Grid>

        <Grid item>
          <FormControl
            className={classes.formControl}
            size="small"
            variant="outlined">
            <InputLabel className={classes.inputLabel}>
              Preset date ranges
            </InputLabel>
            <Select
              value={presetDateRange ? presetDateRange : ''}
              onChange={handleChange}
              label="Preset date ranges">
              <MenuItem value={undefined} disabled></MenuItem>
              <MenuItem
                value="This Week"
                onClick={() => {
                  setDateRange(6, 0);
                }}>
                This Week
              </MenuItem>
              <MenuItem
                value="Last Week"
                onClick={() => {
                  setDateRange(13, 7);
                }}>
                Last Week
              </MenuItem>
              <MenuItem
                value="Last 14 Days"
                onClick={() => {
                  setDateRange(13, 0);
                }}>
                Last 14 Days
              </MenuItem>
              <MenuItem
                value="Last 28 Days"
                onClick={() => {
                  setDateRange(27, 0);
                }}>
                Last 28 Days
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Autocomplete
          id="referrer-select"
          onChange={onReferrerSelect}
          options={referrers}
          getOptionLabel={(referrer) =>
            `${referrer.firstName} - ${referrer.email} - ${referrer.healthFacilityName}`
          }
          renderInput={(params) => (
            <TextField {...params} label="Search Referrer" variant="outlined" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} color="default">
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: 0,
    height: '100%',
    position: 'relative',
    resize: 'both',
  },
  content: {
    height: 600,
  },
  formControl: {
    margin: '4px 8px',
    minWidth: 180,
  },
  floatLeft: {
    float: 'left',
  },
  floatRight: {
    float: 'right',
  },
  right: { marginBottom: '10px' },
  inputLabel: {
    fontSize: '50',
  },
  container: {
    margin: 'auto',
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
}));
