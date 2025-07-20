import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardMember {
  id: number;
  name: string;
  points: number;
  avatar: string;
  badges: string[];
  weeklyGrowth: number;
  level: string;
  rank: number;
}

export interface Stats {
  totalMembers: number;
  topScore: number;
  missionFinishers: number;
  totalComments: number;
  totalLikes: number;
}

// Helper function to generate avatar from name
const generateAvatarFromName = (name: string): string => {
  const firstLetter = name.charAt(0).toUpperCase();
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#6366F1'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="${colors[colorIndex]}" />
      <text x="20" y="28" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${firstLetter}</text>
    </svg>
  `)}`;
};

// 🔒 SECURE: Fetch leaderboard data via Supabase Edge Function
export const fetchLeaderboardData = async (): Promise<LeaderboardMember[]> => {
  try {
    console.log('🔒 SECURE: Fetching leaderboard data via Supabase Edge Function');
    
    const { data, error } = await supabase.functions.invoke('google-sheets-proxy/leaderboard');
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Edge Function error');
    }
    
    const rows = data.data || [];
    console.log('✅ Successfully fetched leaderboard data via secure edge function');
    
    // Skip header row and process data
    const dataRows = rows.slice(1);
    console.log('Processing', dataRows.length, 'leaderboard rows');
    
    // Transform the data into our format
    const members: LeaderboardMember[] = dataRows
      .map((row: string[], index: number) => {
        const name = row[3]?.trim(); // Column D (Required)
        const points = parseInt(row[4]) || 0; // Column E (Required)
        const avatarUrl = row[2]?.trim(); // Column C (Optional)
        const badges = row[5] ? row[5].split(',').map(badge => badge.trim()) : []; // Column F (Optional)
        const level = row[6]?.trim() || ''; // Column G (Optional)
        const weeklyGrowth = parseInt(row[7]) || 0; // Column H (Optional)
        
        // Skip if name is missing (required field)
        if (!name) return null;
        
        // Generate avatar - use provided URL or fallback to first letter
        const avatar = avatarUrl || generateAvatarFromName(name);
        
        return {
          id: index + 1,
          name,
          points,
          avatar,
          badges,
          weeklyGrowth,
          level,
          rank: 0 // Will be set after sorting
        };
      })
      .filter(member => member !== null);
    
    // Sort by points (highest first)
    members.sort((a, b) => b.points - a.points);
    
    // Sort by points first (highest first)
    members.sort((a, b) => b.points - a.points);
    
    // Assign ranks first (dense ranking - same points = same rank, next unique score = next rank)
    let currentRank = 1;
    let lastPoints = members[0]?.points;
    
    members.forEach((member, index) => {
      if (member.points !== lastPoints) {
        currentRank++;
        lastPoints = member.points;
      }
      member.rank = member.points === 0 ? 0 : currentRank; // Special handling for 0 points
    });
    
    // Now group by RANK for shuffling (people with same rank shuffle together)
    const groupedByRank = new Map<number, LeaderboardMember[]>();
    members.forEach(member => {
      const rankGroup = groupedByRank.get(member.rank) || [];
      rankGroup.push(member);
      groupedByRank.set(member.rank, rankGroup);
    });
    
    console.log('📊 Rank groups for shuffling:', 
      Array.from(groupedByRank.entries()).map(([rank, group]) => 
        `Rank ${rank}: ${group.length} people (${group.map(m => m.name).join(', ')})`
      )
    );
    
    // Shuffle members within each RANK group (same rank = shuffle together)
    groupedByRank.forEach((group, rank) => {
      if (group.length > 1) { // Only shuffle if there's more than 1 person in the rank
        // Time-based seed for 1-minute rotation
        const shuffleSeed = Math.floor(Date.now() / (1 * 60 * 1000)) + rank; // Add rank to make each group unique
        console.log(`🔀 Shuffling ${group.length} people in rank ${rank} with seed ${shuffleSeed}`);
        
        const rng = () => {
          // Simple seeded random number generator
          const x = Math.sin(shuffleSeed * group.length) * 10000;
          return x - Math.floor(x);
        };
        
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
      }
    });
    
    // Rebuild the members array with shuffled groups maintaining rank order
    const shuffledMembers: LeaderboardMember[] = [];
    const sortedRanks = Array.from(groupedByRank.keys()).sort((a, b) => {
      // Special handling: 0 rank (0 points) comes last
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });
    
    sortedRanks.forEach(rank => {
      const group = groupedByRank.get(rank)!;
      shuffledMembers.push(...group);
    });
    
    console.log('✅ Leaderboard data processed successfully with proper ranking and shuffling');
    return shuffledMembers;
    
  } catch (error) {
    console.error('💥 Error fetching leaderboard data:', error);
    console.log('🔄 Using fallback data');
    
    // Fallback data if real data fails
    return [
      {
        id: 1,
        name: 'Sample User',
        points: 100,
        avatar: generateAvatarFromName('Sample User'),
        badges: ['Contributor'],
        weeklyGrowth: 10,
        level: 'Beginner',
        rank: 1
      }
    ];
  }
};

// 🔒 SECURE: Fetch stats data via Supabase Edge Function
export const fetchStatsData = async (): Promise<Stats> => {
  try {
    console.log('🔒 SECURE: Fetching stats data via Supabase Edge Function');
    
    const { data, error } = await supabase.functions.invoke('google-sheets-proxy/stats');
    
    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Edge Function error');
    }
    
    const rows = data.data || [];
    console.log('✅ Successfully fetched stats data via secure edge function');
    
    if (rows.length < 2) {
      throw new Error('Invalid stats data format');
    }
    
    const statsRow = rows[1]; // Second row contains the data
    
    return {
      totalMembers: parseInt(statsRow[0]) || 0,
      topScore: parseInt(statsRow[1]) || 0,
      missionFinishers: parseInt(statsRow[2]) || 0,
      totalComments: parseInt(statsRow[3]) || 0,
      totalLikes: parseInt(statsRow[4]) || 0
    };
    
  } catch (error) {
    console.error('💥 Error fetching stats data:', error);
    console.log('🔄 Using fallback stats');
    
    // Fallback stats if real data fails
    return {
      totalMembers: 150,
      topScore: 2500,
      missionFinishers: 45,
      totalComments: 320,
      totalLikes: 890
    };
  }
};