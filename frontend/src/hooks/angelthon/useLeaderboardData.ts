
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboardData, LeaderboardMember } from '@/services/secureGoogleSheetsService';

// Demo data for fallback
const demoLeaderboardData: LeaderboardMember[] = [
  {
    id: 1,
    name: "Sarah Angel",
    points: 2850,
    avatar: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233B82F6' /%3E%3Ctext x='20' y='28' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3ES%3C/text%3E%3C/svg%3E",
    badges: ["Early Bird", "Consistent", "Top Performer"],
    weeklyGrowth: 150,
    level: "Gold",
    rank: 1
  },
  {
    id: 2,
    name: "Michael Chen",
    points: 2650,
    avatar: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2310B981' /%3E%3Ctext x='20' y='28' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EM%3C/text%3E%3C/svg%3E",
    badges: ["Team Player", "Mentor"],
    weeklyGrowth: 120,
    level: "Gold",
    rank: 2
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    points: 2400,
    avatar: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='20' fill='%238B5CF6' /%3E%3Ctext x='20' y='28' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EE%3C/text%3E%3C/svg%3E",
    badges: ["Creative", "Innovator"],
    weeklyGrowth: 100,
    level: "Silver",
    rank: 3
  }
];

const fetchLeaderboardWithFallback = async (): Promise<LeaderboardMember[]> => {
  try {
    console.log('🏆 Attempting to fetch leaderboard data...');
    const data = await fetchLeaderboardData();
    console.log('✅ Successfully fetched leaderboard data:', data?.length || 0, 'members');
    return data;
  } catch (error) {
    console.error('❌ Error fetching leaderboard data:', error);
    console.log('🔄 Using demo leaderboard data as fallback');
    return demoLeaderboardData;
  }
};

export const useLeaderboardData = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboardWithFallback,
    refetchInterval: 1 * 60 * 1000, // 🔄 Refresh every 1 minute
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
