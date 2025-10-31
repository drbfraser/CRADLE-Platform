import { useCurrentUser } from '../auth/useCurrentUser';
import { useState, useEffect, SyntheticEvent } from 'react';
import { useDateRangeState } from 'src/shared/components/Date/useDateRangeState';
import { Referrer, ReferralFilter } from 'src/shared/types/referralTypes';
import { TrafficLightEnum } from 'src/shared/enums';
import { useHealthFacilityNames } from '../healthFacilityNames';
import { useQuery } from '@tanstack/react-query';
import { getVHTsAsync } from 'src/shared/api';

interface useFilterDialogProps {
  filter: ReferralFilter;
  onClose: () => void;
  setIsPromptShown: (isPromptShown: boolean) => void;
  setFilter: (filter: ReferralFilter) => void;
}

export const useFilterDialog = ({
  filter,
  onClose,
  setIsPromptShown,
  setFilter,
}: useFilterDialogProps) => {
  const currentUser = useCurrentUser();
  const [selectedHealthFacilities, setSelectedHealthFacilities] = useState<
    string[]
  >([]);

  const dateRangeState = useDateRangeState();

  const [selectedReferrers, setSelectedReferrers] = useState<Referrer[]>([]);

  const [selectedVitalSign, setSelectedVitalSign] = useState<
    TrafficLightEnum[]
  >([]);

  const [isPregnant, setIsPregnant] = useState<string>('');
  const [isAssessed, setIsAssessed] = useState<string>('');

  const healthFacilityNames = useHealthFacilityNames();

  const referrersQuery = useQuery({
    queryKey: ['userVHTs'],
    queryFn: getVHTsAsync,
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
    setIsPregnant('');
    setIsAssessed('');
  };

  const onFacilitySelect = (
    _event: SyntheticEvent<Element, Event>,
    value: string | null
  ) => {
    if (!value) {
      return;
    }
    if (!selectedHealthFacilities.includes(value)) {
      setSelectedHealthFacilities([...selectedHealthFacilities, value].sort());
    }
  };

  const onReferrerSelect = (_event: any, value: Referrer | null) => {
    if (!value) {
      return;
    }
    if (!selectedReferrers.includes(value)) {
      setSelectedReferrers(
        [...selectedReferrers, value].sort((a, b) =>
          String(a.userId).localeCompare(String(b.userId))
        )
      );
    }
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

  const filterHasChanged = () => {
    const dateRange =
      dateRangeState.startDate && dateRangeState.endDate
        ? `${dateRangeState.startDate.toDate().getTime() / 1000}:${
            dateRangeState.endDate.toDate().getTime() / 1000
          }`
        : '';
    if (
      // selected filter is the same as current filter
      filter &&
      JSON.stringify(selectedHealthFacilities) ===
        JSON.stringify(filter.healthFacilityNames) &&
      dateRange === filter.dateRange &&
      JSON.stringify(selectedReferrers.map((r) => r.userId)) ===
        JSON.stringify(filter.referrers) &&
      JSON.stringify(selectedVitalSign) === JSON.stringify(filter.vitalSigns) &&
      isAssessed === filter.isAssessed &&
      isPregnant === filter.isPregnant
    ) {
      return false;
    } else if (
      // selected filter is empty and current filter is undefined
      !filter &&
      selectedHealthFacilities.length < 1 &&
      !dateRangeState.startDate &&
      !dateRangeState.endDate &&
      !dateRangeState.presetDateRange &&
      selectedReferrers.length < 1 &&
      selectedVitalSign.length < 1 &&
      !isPregnant &&
      !isAssessed
    ) {
      return false;
    } else {
      return true;
    }
  };

  const onConfirm = () => {
    if (!filterHasChanged()) {
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

  return {
    healthFacilityNames,
    referrersQuery,
    currentUser,
    selectedHealthFacilities,
    dateRangeState,
    selectedReferrers,
    selectedVitalSign,
    isPregnant,
    isAssessed,
    clearFilter,
    onConfirm,
    setIsAssessed,
    setIsPregnant,
    setSelectedVitalSign,
    onFacilitySelect,
    onReferrerSelect,
    handleDeleteFacilityChip,
    handleDeleteReferrerChip,
    handleRadioButtonClick,
  };
};
