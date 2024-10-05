import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';

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
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { ReduxState } from 'src/redux/reducers';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { TextField } from '@mui/material';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { TrafficLightEnum } from 'src/shared/enums';
import { useSelector } from 'react-redux';
import {
  DateRangePickerWithPreset,
  DateRangePreset,
} from 'src/shared/components/Date/DateRangePicker';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';

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
  const [selectedHealthFacilities, setSelectedHealthFacilities] = useState<
    string[]
  >([]);
  const [healthFacilities, setHealthFacilities] = useState<string[]>([]);

  const dateRangeState = useDateRangeState();

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
  }, [user]);

  const clearFilter = () => {
    setSelectedHealthFacilities([]);
    setSelectedReferrers([]);
    setSelectedVitalSign([]);
    dateRangeState.setStartDate(null);
    dateRangeState.setEndDate(null);
    dateRangeState.setPresetDateRange(null);
    setIsPregnant(undefined);
    setIsAssessed(undefined);
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
    // User did not change any filter
    if (
      selectedHealthFacilities.length < 1 &&
      !dateRangeState.startDate &&
      !dateRangeState.endDate &&
      !dateRangeState.presetDateRange &&
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
        dateRangeState.startDate && dateRangeState.endDate
          ? `${dateRangeState.startDate.toDate().getTime() / 1000}:${
              dateRangeState.endDate.toDate().getTime() / 1000
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
      <DialogContent
        sx={{
          maxHeight: '600px',
        }}>
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
            <DateRangePickerWithPreset {...dateRangeState} />
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
                    <DoneIcon
                      sx={{
                        color: '#4caf50',
                        padding: '2px',
                      }}
                    />
                    Complete
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
                    <ScheduleIcon
                      sx={{
                        color: '#f44336',
                        padding: '2px',
                      }}
                    />
                    Pending
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
