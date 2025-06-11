import { useQuery } from '@tanstack/react-query';
import { getUserStatisticsAsync } from 'src/shared/api';

export const useUserStatsQuery = (userId: string, from: number, to: number) => {
  return useQuery({
    queryKey: ['user', userId, from, to],
    queryFn: () => getUserStatisticsAsync(userId, from, to),
    enabled: !!userId,
  });
};
