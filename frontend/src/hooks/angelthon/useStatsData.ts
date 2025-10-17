
import { useQuery } from '@tanstack/react-query';
import { fetchStatsData } from '@/services/secureGoogleSheetsService';

export const useStatsData = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStatsData,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
};
