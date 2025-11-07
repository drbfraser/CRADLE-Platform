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

import { ReferralFilter } from 'src/shared/types/referralTypes';
import { TrafficLightEnum } from 'src/shared/enums';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { DateRangePickerWithPreset } from 'src/shared/components/Date/DateRangePicker';
import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';
import { useFilterDialog } from 'src/shared/hooks/referrals/useFilterDialog';

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
  const hook = useFilterDialog({
    filter,
    onClose,
    setIsPromptShown,
    setFilter,
  });

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
                onChange={hook.onFacilitySelect}
                options={hook.healthFacilityNames}
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
                {hook.selectedHealthFacilities.map((facility, index) => (
                  <Chip
                    key={index}
                    sx={{ mx: 0.5 }}
                    label={facility}
                    onDelete={() => hook.handleDeleteFacilityChip(index)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Date Range
              </Typography>
              <DateRangePickerWithPreset {...hook.dateRangeState} clearButton />
            </Grid>
            <Grid size={12}>
              <Typography variant="h4" component="h3">
                Referrer
              </Typography>
              <Autocomplete
                id="referrer-select"
                onChange={hook.onReferrerSelect}
                options={hook.referrersQuery.data ?? []}
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
                {hook.selectedReferrers.map((referrer, index) => (
                  <Box mx={0.5} key={referrer.userId}>
                    <Chip
                      label={referrer.firstName}
                      onDelete={() => hook.handleDeleteReferrerChip(index)}
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
                      checked={hook.selectedVitalSign.includes(
                        vitalSign.vitalSign
                      )}
                      onChange={(event, checked) => {
                        if (checked) {
                          hook.setSelectedVitalSign(
                            [
                              ...hook.selectedVitalSign,
                              TrafficLightEnum[
                                event.target
                                  .value as keyof typeof TrafficLightEnum
                              ],
                            ].sort()
                          );
                        } else {
                          const newVitalSigns = [...hook.selectedVitalSign];
                          const i = newVitalSigns.indexOf(
                            TrafficLightEnum[
                              event.target
                                .value as keyof typeof TrafficLightEnum
                            ]
                          );
                          if (i > -1) {
                            newVitalSigns.splice(i, 1);
                          }
                          hook.setSelectedVitalSign(newVitalSigns);
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
                value={hook.isPregnant ?? ''}
                onChange={(_, value) => hook.setIsPregnant(value)}>
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      checked={hook.isPregnant === `1`}
                      onClick={(event) => {
                        hook.handleRadioButtonClick(
                          event,
                          hook.isPregnant,
                          hook.setIsPregnant
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
                      checked={hook.isPregnant === `0`}
                      onClick={(event) => {
                        hook.handleRadioButtonClick(
                          event,
                          hook.isPregnant,
                          hook.setIsPregnant
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
                value={hook.isAssessed ?? ''}
                onChange={(_, value) => hook.setIsAssessed(value)}>
                <FormControlLabel
                  value="1"
                  control={
                    <Radio
                      checked={hook.isAssessed === `1`}
                      onClick={(event) => {
                        hook.handleRadioButtonClick(
                          event,
                          hook.isAssessed,
                          hook.setIsAssessed
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
                      checked={hook.isAssessed === `0`}
                      onClick={(event) => {
                        hook.handleRadioButtonClick(
                          event,
                          hook.isAssessed,
                          hook.setIsAssessed
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
          <SecondaryButton onClick={hook.clearFilter}>
            Clear All
          </SecondaryButton>
          <PrimaryButton onClick={hook.onConfirm}>Apply Filter</PrimaryButton>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
