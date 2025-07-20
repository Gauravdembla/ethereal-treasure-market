
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboardData } from '@/services/secureGoogleSheetsService';

export const useLeaderboardData = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardData,
    refetchInterval: 1 * 60 * 1000, // 🔄 Refresh every 1 minute  
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
