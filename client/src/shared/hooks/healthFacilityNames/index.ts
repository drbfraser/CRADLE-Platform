import { useHealthFacilitiesQuery } from 'src/shared/queries';

export const useHealthFacilityNames = (): string[] => {
  const query = useHealthFacilitiesQuery();
  return query.data?.map((facility) => facility.name) ?? [];
};
