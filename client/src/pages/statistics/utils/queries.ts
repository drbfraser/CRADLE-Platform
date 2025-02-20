import { useQuery } from '@tanstack/react-query';
import { getUserStatisticsAsync } from 'src/shared/api/apiStatistics';

export const useUserStatsQuery = (user: string, from: number, to: number) => {
  return useQuery({
    queryKey: ['user', user, from, to],
    queryFn: () => getUserStatisticsAsync(user, from, to),
    enabled: !!user,
  });
};
