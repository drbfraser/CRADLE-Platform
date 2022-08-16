import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';
import { DateRangePicker, FocusedInputShape } from 'react-dates';
import {
  IFacility,
  IUserWithTokens,
  OrNull,
  ReferralFilter,
  Referrer,
} from 'src/shared/types';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { getHealthFacilitiesAsync, getUserVhtsAsync } from 'src/shared/api';
import moment, { Moment } from 'moment';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DoneIcon from '@mui/icons-material/Done';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { ReduxState } from 'src/redux/reducers';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';

interface IProps {
  open: boolean;
  filter: ReferralFilter;
  isTransformed: boolean;
  onClose: () => void;
  setFilter: (filter: ReferralFilter) => void;
  setIsPromptShown: (isPromptShown: boolean) => void;
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
    name: 'None',
    vitalSign: TrafficLightEnum.NONE,
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
  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(
    null
  );

  const [selectedReferrers, setSelectedReferrers] = useState<Referrer[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  const [selectedVitalSign, setSelectedVitalSign] = useState<
    TrafficLightEnum[]
  >([]);

  const [isPregnant, setIsPregnant] = useState<string>();
  const [isAssessed, setIsAssessed] = useState<string>();

  useEffect(() => {
    const fetchHealthFacilities = async () => {
      try {
        const facilities = await getHealthFacilitiesAsync();

        setHealthFacilities(
          facilities.map((facility: IFacility) => facility.healthFacilityName)
        );
      } catch (e) {
        console.log(e);
      }
    };

    const fetchUserVhts = async () => {
      try {
        setReferrers(await getUserVhtsAsync());
      } catch (e) {
        console.log(e);
      }
    };

    fetchHealthFacilities();
    fetchUserVhts();
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

  const onFacilitySelect = (
    _event: SyntheticEvent<Element, Event>,
    value: string | null
  ) => {
    if (!value) {
      return;
    }
    setSelectedHealthFacilities([...selectedHealthFacilities, value]);
  };

  const onReferrerSelect = (_event: any, value: Referrer | null) => {
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
            <h4>Health Facility</h4>
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
            <h4>Date Range</h4>
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
                variant="standard"
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
            <SecondaryButton
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setPresetDateRange(undefined);
              }}>
              Clear
            </SecondaryButton>
          </Grid>
          <Grid item md={12} sm={12} xs={12}>
            <h4>Referrer</h4>
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
            <h4>Cradle Readings</h4>
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
            <h4>Pregnant</h4>
            <RadioGroup
              aria-label="isPregnant"
              value={isPregnant}
              onChange={(_, value) => setIsPregnant(value)}>
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
            <h4>Assessment Status</h4>
            <RadioGroup
              aria-label="isAssessed"
              value={isAssessed}
              onChange={(_, value) => setIsAssessed(value)}>
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
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <SecondaryButton onClick={clearFilter}>Clear All</SecondaryButton>
        <PrimaryButton onClick={onConfirm}>Apply Filter</PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export const useStyles = makeStyles((_) => ({
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
