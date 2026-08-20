import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { ReferralFilter } from 'src/shared/types/referralTypes';
import {
  CancelButton,
  PrimaryButton,
  SecondaryButton,
} from 'src/shared/components/Button';
import { useFilterDialog } from 'src/shared/hooks/referrals/useFilterDialog';
import { HealthFacilityFilterGroup } from './components/filterDialog/HealthFacilityFilterGroup';
import { DateRangeFilterGroup } from './components/filterDialog/DateRangeFilterGroup';
import { ReferrerFilterGroup } from './components/filterDialog/ReferrerFilterGroup';
import { VitalSignsFilterGroup } from './components/filterDialog/VitalSignsFilterGroup';
import { PregnancyFilterGroup } from './components/filterDialog/PregnancyFilterGroup';
import { AssessmentStatusFilterGroup } from './components/filterDialog/AssessmentStatusFilterGroup';

interface IProps {
  open: boolean;
  filter: ReferralFilter;
  isTransformed: boolean;
  onClose: () => void;
  setFilter: (filter: ReferralFilter) => void;
  setIsPromptShown: (isPromptShown: boolean) => void;
}

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
        <DialogContent sx={{ maxHeight: '600px' }}>
          <Grid container spacing={3}>
            <HealthFacilityFilterGroup
              healthFacilityNames={hook.healthFacilityNames}
              selectedHealthFacilities={hook.selectedHealthFacilities}
              onFacilitySelect={hook.onFacilitySelect}
              handleDeleteFacilityChip={hook.handleDeleteFacilityChip}
            />
            <DateRangeFilterGroup dateRangeState={hook.dateRangeState} />
            <ReferrerFilterGroup
              referrersQuery={hook.referrersQuery}
              selectedReferrers={hook.selectedReferrers}
              onReferrerSelect={hook.onReferrerSelect}
              handleDeleteReferrerChip={hook.handleDeleteReferrerChip}
            />
            <VitalSignsFilterGroup
              selectedVitalSign={hook.selectedVitalSign}
              setSelectedVitalSign={hook.setSelectedVitalSign}
            />
            <PregnancyFilterGroup
              isPregnant={hook.isPregnant}
              setIsPregnant={hook.setIsPregnant}
              handleRadioButtonClick={hook.handleRadioButtonClick}
            />
            <AssessmentStatusFilterGroup
              isAssessed={hook.isAssessed}
              setIsAssessed={hook.setIsAssessed}
              handleRadioButtonClick={hook.handleRadioButtonClick}
            />
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
