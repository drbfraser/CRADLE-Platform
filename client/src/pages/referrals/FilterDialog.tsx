import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { ReferralFilter, Referrer } from 'src/shared/types/referralTypes';
import { getUserVhtsAsync } from 'src/shared/api';
import { TrafficLightEnum } from 'src/shared/enums';
import { useHealthFacilityNames } from 'src/shared/hooks/healthFacilityNames';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';
import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';
import { useCurrentUser } from 'src/shared/hooks/auth/useCurrentUser';

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

const VITAL_SIGNS: readonly VitalSign[] = [
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

export const FilterDialog = ({
  open,
  filter,
  isTransformed,
  onClose,
  setFilter,
  setIsPromptShown,
}: IProps) => {
  const currentUser = useCurrentUser();
  const [selectedHealthFacilities, setSelectedHealthFacilities] = useState<
    string[]
  >([]);

  const dateRangeState = useDateRangeState();

  const [selectedReferrers, setSelectedReferrers] = useState<Referrer[]>([]);

  const [selectedVitalSign, setSelectedVitalSign] = useState<
    TrafficLightEnum[]
  >([]);

  const [isPregnant, setIsPregnant] = useState<string>();
  const [isAssessed, setIsAssessed] = useState<string>();

  const healthFacilityNames = useHealthFacilityNames();

  const referrersQuery = useQuery({
    queryKey: ['userVHTs'],
    queryFn: getUserVhtsAsync,
  });

  useEffect(() => {
    if (filter === undefined) {
      clearFilter();
    }
  }, [filter]);

  useEffect(() => {
    if (currentUser) {
      const currentSelectedHealthFacilities = selectedHealthFacilities;
      setSelectedHealthFacilities([
        ...currentSelectedHealthFacilities,
        currentUser.healthFacilityName,
      ]);
      applyFilter([
        ...currentSelectedHealthFacilities,
        currentUser.healthFacilityName,
      ]);
    }
  }, [currentUser]);

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
      selectedHealthFacilities[0] === currentUser?.healthFacilityName
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
      <Stack sx={{ padding: '20px' }} spacing={'20px'}>
        <DialogTitle id="filter-dialog" variant="h3">
          Advanced Search
        </DialogTitle>
        <DialogContent
          sx={{
            maxHeight: '600px',
          }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Health Facility
              </Typography>
              <Autocomplete
                id="facility-select"
                onChange={onFacilitySelect}
                options={healthFacilityNames}
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
                  <Chip
                    key={index}
                    sx={{ mx: 0.5 }}
                    label={facility}
                    onDelete={() => handleDeleteFacilityChip(index)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Date Range
              </Typography>
              <DateRangePickerWithPreset {...dateRangeState} clearButton />
            </Grid>
            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Referrer
              </Typography>
              <Autocomplete
                id="referrer-select"
                onChange={onReferrerSelect}
                options={referrersQuery.data ?? []}
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
                  <Box mx={0.5} key={referrer.userId}>
                    <Chip
                      label={referrer.firstName}
                      onDelete={() => handleDeleteReferrerChip(index)}
                      color="primary"
                    />
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Cradle Readings
              </Typography>
              {VITAL_SIGNS.map((vitalSign, index) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedVitalSign.includes(vitalSign.vitalSign)}
                      onChange={(event, checked) => {
                        if (checked) {
                          setSelectedVitalSign([
                            ...selectedVitalSign,
                            TrafficLightEnum[
                              event.target
                                .value as keyof typeof TrafficLightEnum
                            ],
                          ]);
                        } else {
                          const newVitalSigns = [...selectedVitalSign];
                          const i = newVitalSigns.indexOf(
                            TrafficLightEnum[
                              event.target
                                .value as keyof typeof TrafficLightEnum
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

            <Grid size={6}>
              <Typography variant="h4" component="h3">
                Pregnant
              </Typography>
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
                        handleRadioButtonClick(
                          event,
                          isPregnant,
                          setIsPregnant
                        );
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
                        handleRadioButtonClick(
                          event,
                          isPregnant,
                          setIsPregnant
                        );
                      }}
                    />
                  }
                  label="No"
                />
              </RadioGroup>
            </Grid>

            <Grid size={6}>
              <Typography variant="h4" component="h3">
                Assessment Status
              </Typography>
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
                        handleRadioButtonClick(
                          event,
                          isAssessed,
                          setIsAssessed
                        );
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
                        handleRadioButtonClick(
                          event,
                          isAssessed,
                          setIsAssessed
                        );
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
      </Stack>
    </Dialog>
  );
};
