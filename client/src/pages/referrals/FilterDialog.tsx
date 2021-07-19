import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
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
import { EndpointEnum, TrafficLightEnum } from 'src/shared/enums';
import { TextField } from '@material-ui/core';
import { TrafficLight } from 'src/shared/components/trafficLight';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';

interface IProps {
  open: boolean;
  filter: ReferralFilter;
  isTransformed: boolean;
  onClose: () => void;
  setFilter: React.Dispatch<React.SetStateAction<ReferralFilter>>;
}

type VitalSign = {
  name: string;
  vitalSign: TrafficLightEnum;
};

export const FilterDialog = ({
  open,
  filter,
  isTransformed,
  onClose,
  setFilter,
}: IProps) => {
  const classes = useStyles();

  const [selectedHealthFacilities, setSelectedHealthFacilities] = useState<
    IFacility[]
  >([]);
  const [healthFacilities, setHealthFacilities] = useState<IFacility[]>([]);

  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [endDate, setEndDate] = useState<Moment | null>(null);
  const [presetDateRange, setPresetDateRange] = useState();
  const [focusedInput, setFocusedInput] =
    useState<FocusedInputShape | null>(null);

  const [selectedReferrers, setSelectedReferrers] = useState<Referrer[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  const [selectedVitalSign, setSelectedVitalSign] =
    useState<TrafficLightEnum>();

  const [isPregnant, setIsPregnant] = useState<number>();
  const [isAssessed, setIsAssessed] = useState<number>();

  const vitalSigns: VitalSign[] = [
    {
      name: 'Green',
      vitalSign: TrafficLightEnum.GREEN,
    },
    {
      name: 'Yellow Up',
      vitalSign: TrafficLightEnum.YELLOW_UP,
    },
    {
      name: 'Yellow Down',
      vitalSign: TrafficLightEnum.YELLOW_DOWN,
    },
    {
      name: 'Red Up',
      vitalSign: TrafficLightEnum.RED_UP,
    },
    {
      name: 'Red Down',
      vitalSign: TrafficLightEnum.RED_DOWN,
    },
  ];

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

  useEffect(() => {
    if (filter === undefined) {
      clearFilter();
    }
  }, [filter]);

  const clearFilter = () => {
    setSelectedHealthFacilities([]);
    setSelectedReferrers([]);
    setSelectedVitalSign(undefined);
    setStartDate(null);
    setEndDate(null);
    setPresetDateRange(undefined);
    setIsPregnant(undefined);
    setIsAssessed(undefined);
  };

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
    setSelectedHealthFacilities([...selectedHealthFacilities, value]);
  };

  const onReferrerSelect = (_event: any, value: Referrer) => {
    if (!value) {
      return;
    }
    setSelectedReferrers([...selectedReferrers, value]);
  };

  const handleDeleteFacilityChip = (index: number) => {
    const newFacilities = [...selectedHealthFacilities];
    newFacilities.splice(index, 1);
    setSelectedHealthFacilities(newFacilities);
  };

  const handleDeleteReferrerChip = (index: number) => {
    const newReferrers = [...selectedReferrers];
    newReferrers.splice(index, 1);
    setSelectedReferrers(newReferrers);
  };

  const onConfirm = () => {
    setFilter({
      ...filter,
      healthFacilityNames: selectedHealthFacilities.map(
        (f) => f.healthFacilityName
      ),
      dateRange:
        startDate && endDate
          ? `${startDate.toDate().getTime() / 1000}:${
              endDate.toDate().getTime() / 1000
            }`
          : '',
      referrers: selectedReferrers.map((r) => r.userId),
      vitalSigns: selectedVitalSign,
      isPregnant: isPregnant,
      isAssessed: isAssessed,
    });
    onClose();
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
        <Grid container spacing={3}>
          <Grid item md={12} sm={12} xs={12}>
            <b>Health Facility</b>
            <br />
            <br />
            <Autocomplete
              id="facility-select"
              onChange={onFacilitySelect}
              options={healthFacilities}
              getOptionLabel={(facility) => facility.healthFacilityName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Facility"
                  variant="outlined"
                />
              )}
            />
            <Box m={1.5} display="flex" flexWrap="wrap">
              {selectedHealthFacilities.map((facility, index) => (
                <Box m={0.5} key={facility.healthFacilityName}>
                  <Chip
                    label={facility.healthFacilityName}
                    onDelete={() => handleDeleteFacilityChip(index)}
                    color="primary"
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item md={12} sm={12} xs={12}>
            <b>Date Range</b>
            <br />
            <br />
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
            <Button
              variant="contained"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setPresetDateRange(undefined);
              }}
              color="default">
              Clear
            </Button>
          </Grid>
          <Grid item md={12} sm={12} xs={12}>
            <b>Referrer</b>
            <br />
            <br />
            <Autocomplete
              id="referrer-select"
              onChange={onReferrerSelect}
              options={referrers}
              getOptionLabel={(referrer) =>
                `${referrer.firstName} - ${referrer.email} - ${referrer.healthFacilityName}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Referrer"
                  variant="outlined"
                />
              )}
            />
            <Box m={1.5} display="flex" flexWrap="wrap">
              {selectedReferrers.map((referrer, index) => (
                <Box m={0.5} key={referrer.userId}>
                  <Chip
                    label={referrer.firstName}
                    onDelete={() => handleDeleteReferrerChip(index)}
                    color="primary"
                  />
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid item>
            <b>Health Status</b>
            <br />
            {vitalSigns.map((vitalSign, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={vitalSign.vitalSign === selectedVitalSign}
                    onChange={(event, checked) =>
                      checked
                        ? setSelectedVitalSign(
                            TrafficLightEnum[
                              event.target
                                .value as keyof typeof TrafficLightEnum
                            ]
                          )
                        : setSelectedVitalSign(undefined)
                    }
                    value={vitalSign.vitalSign}
                  />
                }
                label={
                  <>
                    <TrafficLight status={vitalSign.vitalSign} />{' '}
                    {vitalSign.name}
                  </>
                }
                key={index}
              />
            ))}
          </Grid>
          <Grid item md={6} sm={6}>
            <b>Pregnant</b>
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPregnant === 1}
                  value={1}
                  onChange={(_, checked) =>
                    checked ? setIsPregnant(1) : setIsPregnant(undefined)
                  }
                />
              }
              label="Yes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPregnant === 0}
                  value={0}
                  onChange={(_, checked) =>
                    checked ? setIsPregnant(0) : setIsPregnant(undefined)
                  }
                />
              }
              label="No"
            />
          </Grid>
          <Grid item md={6} sm={6}>
            <b>Assessment Status</b>
            <br />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAssessed === 1}
                  value={1}
                  onChange={(_, checked) =>
                    checked ? setIsAssessed(1) : setIsAssessed(undefined)
                  }
                />
              }
              label={
                <>
                  <DoneIcon className={classes.green} /> Complete
                </>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAssessed === 0}
                  value={0}
                  onChange={(_, checked) =>
                    checked ? setIsAssessed(0) : setIsAssessed(undefined)
                  }
                />
              }
              label={
                <>
                  <ScheduleIcon className={classes.red} /> Pending
                </>
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} color="default">
          Cancel
        </Button>
        <Button variant="contained" onClick={clearFilter} color="default">
          Clear All
        </Button>
        <Button variant="contained" onClick={onConfirm} color="primary">
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
    maxHeight: 600,
  },
  formControl: {
    margin: '4px 8px',
    minWidth: 180,
  },
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
  red: {
    color: '#f44336',
    padding: '2px',
  },
  green: {
    color: '#4caf50',
    padding: '2px',
  },
}));
