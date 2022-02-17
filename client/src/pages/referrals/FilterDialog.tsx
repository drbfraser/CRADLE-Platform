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
import {
  IFacility,
  ReferralFilter,
  Referrer,
  IUserWithTokens,
  OrNull,
} from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, TrafficLightEnum } from 'src/shared/enums';
import { TextField } from '@material-ui/core';
import { TrafficLight } from 'src/shared/components/trafficLight';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import DoneIcon from '@material-ui/icons/Done';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useSelector } from 'react-redux';
import { ReduxState } from 'src/redux/reducers';

interface IProps {
  open: boolean;
  filter: ReferralFilter;
  isTransformed: boolean;
  onClose: () => void;
  setFilter: React.Dispatch<React.SetStateAction<ReferralFilter>>;
  setIsPromptShown: React.Dispatch<React.SetStateAction<boolean>>;
}

type VitalSign = {
  name: string;
  vitalSign: TrafficLightEnum;
};

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
  {
    name: 'Unavailable',
    vitalSign: TrafficLightEnum.UNAVAILABLE,
  },
];

type SelectorState = {
  user: OrNull<IUserWithTokens>;
};

export const FilterDialog = ({
  open,
  filter,
  isTransformed,
  onClose,
  setFilter,
  setIsPromptShown,
}: IProps) => {
  const { user } = useSelector(
    ({ user }: ReduxState): SelectorState => ({
      user: user.current.data,
    })
  );
  const classes = useStyles();

  const [selectedHealthFacilities, setSelectedHealthFacilities] = useState<
    string[]
  >([]);
  const [healthFacilities, setHealthFacilities] = useState<string[]>([]);

  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [endDate, setEndDate] = useState<Moment | null>(null);
  const [presetDateRange, setPresetDateRange] = useState();
  const [focusedInput, setFocusedInput] =
    useState<FocusedInputShape | null>(null);

  const [selectedReferrers, setSelectedReferrers] = useState<Referrer[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  const [selectedVitalSign, setSelectedVitalSign] = useState<
    TrafficLightEnum[]
  >([]);

  const [isPregnant, setIsPregnant] = useState<string>();
  const [isAssessed, setIsAssessed] = useState<string>();

  useEffect(() => {
    apiFetch(API_URL + EndpointEnum.HEALTH_FACILITIES)
      .then((resp) => resp.json())
      .then((jsonResp: IFacility[]) => {
        const facilities = jsonResp.map((f) => f.healthFacilityName);
        setHealthFacilities(facilities);
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

  useEffect(() => {
    if (user) {
      const currentSelectedHealthFacilities = selectedHealthFacilities;
      setSelectedHealthFacilities([
        ...currentSelectedHealthFacilities,
        user.healthFacilityName,
      ]);
      applyFilter([
        ...currentSelectedHealthFacilities,
        user.healthFacilityName,
      ]);
    }
    // eslint-disable-next-line
  }, [user]);

  const clearFilter = () => {
    setSelectedHealthFacilities([]);
    setSelectedReferrers([]);
    setSelectedVitalSign([]);
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

  const onFacilitySelect = (_event: any, value: string) => {
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

  const handleRadioButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    value: any,
    setValue: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const element = event.currentTarget as HTMLInputElement;
    const eventValue = element.value;
    if (eventValue === value) {
      setValue(undefined);
    } else {
      setValue(eventValue);
    }
  };

  const onConfirm = () => {
    //User did not change any filter
    if (
      selectedHealthFacilities.length < 1 &&
      !startDate &&
      !endDate &&
      !presetDateRange &&
      selectedReferrers.length < 1 &&
      selectedVitalSign.length < 1 &&
      !isPregnant &&
      !isAssessed
    ) {
      onClose();
      return;
    }
    applyFilter(selectedHealthFacilities);
    if (
      selectedHealthFacilities.length === 1 &&
      selectedHealthFacilities[0] === user?.healthFacilityName
    ) {
      setIsPromptShown(true);
    } else {
      setIsPromptShown(false);
    }
    onClose();
  };

  const applyFilter = (currentSelectedHealthFacilities: string[]) => {
    setFilter({
      ...filter,
      healthFacilityNames: currentSelectedHealthFacilities,
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
              getOptionLabel={(facility) => facility}
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
                <Box m={0.5} key={index}>
                  <Chip
                    label={facility}
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
            <b>Cradle Readings</b>
            <br />
            {vitalSigns.map((vitalSign, index) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedVitalSign.includes(vitalSign.vitalSign)}
                    onChange={(event, checked) => {
                      if (checked) {
                        setSelectedVitalSign([
                          ...selectedVitalSign,
                          TrafficLightEnum[
                            event.target.value as keyof typeof TrafficLightEnum
                          ],
                        ]);
                      } else {
                        const newVitalSigns = [...selectedVitalSign];
                        const i = newVitalSigns.indexOf(
                          TrafficLightEnum[
                            event.target.value as keyof typeof TrafficLightEnum
                          ]
                        );
                        if (i > -1) {
                          newVitalSigns.splice(i, 1);
                        }
                        setSelectedVitalSign(newVitalSigns);
                      }
                    }}
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
            <RadioGroup
              aria-label="isPregnant"
              value={isPregnant}
              onChange={(event, value) => setIsPregnant(value)}>
              <FormControlLabel
                value="1"
                control={
                  <Radio
                    checked={isPregnant === `1`}
                    onClick={(event) => {
                      handleRadioButtonClick(event, isPregnant, setIsPregnant);
                    }}
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="0"
                control={
                  <Radio
                    checked={isPregnant === `0`}
                    onClick={(event) => {
                      handleRadioButtonClick(event, isPregnant, setIsPregnant);
                    }}
                  />
                }
                label="No"
              />
            </RadioGroup>
          </Grid>
          <Grid item md={6} sm={6}>
            <b>Assessment Status</b>
            <br />
            <RadioGroup
              aria-label="isAssessed"
              value={isAssessed}
              onChange={(event, value) => setIsAssessed(value)}>
              <FormControlLabel
                value="1"
                control={
                  <Radio
                    checked={isAssessed === `1`}
                    onClick={(event) => {
                      handleRadioButtonClick(event, isAssessed, setIsAssessed);
                    }}
                  />
                }
                label={
                  <>
                    <DoneIcon className={classes.green} /> Complete
                  </>
                }
              />
              <FormControlLabel
                value="0"
                control={
                  <Radio
                    checked={isAssessed === `0`}
                    onClick={(event) => {
                      handleRadioButtonClick(event, isAssessed, setIsAssessed);
                    }}
                  />
                }
                label={
                  <>
                    <ScheduleIcon className={classes.red} /> Pending
                  </>
                }
              />
            </RadioGroup>
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
