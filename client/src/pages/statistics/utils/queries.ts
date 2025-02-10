import { useQuery } from '@tanstack/react-query';
import { statsDataSchema } from 'src/shared/api/validation/statistics';
import { ZodError } from 'zod';
import { getUserStatisticsAsync } from 'src/shared/api/api';

export const statsQueryFn = (fetchData: Promise<unknown>) =>
  fetchData
    .then((res) => statsDataSchema.parseAsync(res))
    .catch((e) => {
      if (e instanceof ZodError) {
        console.error(`Error validating statisitcs data: ${e}`);
      } else {
        console.error(`Error querying for statistics: ${e}`);
      }
      throw e;
    });

export const useUserStatsQuery = (user: string, from: number, to: number) => {
  return useQuery({
    queryKey: ['user', user, from, to],
    queryFn: () => statsQueryFn(getUserStatisticsAsync(user, from, to)),
    enabled: !!user,
  });
};
