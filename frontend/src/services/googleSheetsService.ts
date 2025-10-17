interface LeaderboardMember {
  id: number;
  name: string;
  points: number;
  rank: number;
  avatar: string;
  badges: string[];
  weeklyGrowth: number;
  level: string;
}

interface Stats {
  totalMembers: number;
  topScore: number;
  missionFinishers: number;
  totalComments: number;
  totalLikes: number;
}

// Replace these with your actual values
const GOOGLE_SHEETS_API_KEY = 'AIzaSyCNAQm7L_0ivg_B_gg5uRDiM3LKYmNwod0'; // Replace with your API key
const SPREADSHEET_ID = '1BpwY67E_txhgospW425bjh2RKAEWjVmFPeMDGwAEpS4'; // Replace with your spreadsheet ID
const RANGE = 'Sheet1!A:H'; // Adjust based on your sheet structure
const STATS_RANGE = 'Stats!A:E'; // Adjust based on your stats sheet structure

// Function to get current 15-minute interval seed
const get15MinuteIntervalSeed = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const hour = now.getHours();
  const minute15Interval = Math.floor(now.getMinutes() / 15);
  
  // Create a unique seed for each 15-minute interval
  return year * 1000000 + month * 100000 + day * 1000 + hour * 10 + minute15Interval;
};

// Seeded random number generator for consistent shuffling within 15-minute intervals
const seededRandom = (seed: number) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Fisher-Yates shuffle with seeded random
const shuffleWithSeed = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
    currentIndex--;
    
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  
  return shuffled;
};

export const fetchLeaderboardData = async (): Promise<LeaderboardMember[]> => {
  try {
    console.log('Fetching leaderboard data from Google Sheets...');
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Failed to fetch from Google Sheets:', response.status, response.statusText);
      throw new Error('Failed to fetch data from Google Sheets');
    }
    
    const data = await response.json();
    console.log('Raw Google Sheets data:', data);
    const rows = data.values || [];
    
    // Skip header row
    const dataRows = rows.slice(1);
    console.log('Processing', dataRows.length, 'data rows');
    
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
    
    console.log('Processed', members.length, 'valid members');
    
    // Group members by points for shuffling
    const membersByPoints = new Map<number, LeaderboardMember[]>();
    members.forEach(member => {
      if (!membersByPoints.has(member.points)) {
        membersByPoints.set(member.points, []);
      }
      membersByPoints.get(member.points)!.push(member);
    });
    
    // Get the current 15-minute interval seed
    const seed = get15MinuteIntervalSeed();
    console.log('Using 15-minute interval seed:', seed);
    
    // Shuffle members within each point group using the seed
    const shuffledMembers: LeaderboardMember[] = [];
    const sortedPoints = Array.from(membersByPoints.keys()).sort((a, b) => b - a);
    
    sortedPoints.forEach(points => {
      const membersWithSamePoints = membersByPoints.get(points)!;
      const shuffled = shuffleWithSeed(membersWithSamePoints, seed + points);
      shuffledMembers.push(...shuffled);
    });
    
    console.log('Applied 15-minute rotation shuffle to members with same points');
    
    // Create unique point values (excluding 0) and assign ranks
    const uniquePoints = [...new Set(shuffledMembers.map(member => member.points).filter(points => points > 0))].sort((a, b) => b - a);
    console.log('Unique point values (excluding 0):', uniquePoints);
    
    // Assign ranks based on unique point values
    shuffledMembers.forEach(member => {
      if (member.points === 0) {
        member.rank = 0; // Special value for 0 points - will show as just "#"
      } else {
        const rankIndex = uniquePoints.indexOf(member.points);
        member.rank = rankIndex + 1;
      }
    });
    
    console.log('Leaderboard data processed successfully with 15-minute rotation and special handling for 0 points');
    return shuffledMembers;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    // Return empty array on error
    return [];
  }
};

export const fetchStatsData = async (): Promise<Stats> => {
  try {
    console.log('Fetching stats data from Google Sheets...');
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${STATS_RANGE}?key=${GOOGLE_SHEETS_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Failed to fetch stats from Google Sheets:', response.status, response.statusText);
      throw new Error('Failed to fetch stats data from Google Sheets');
    }
    
    const data = await response.json();
    console.log('Raw stats data:', data);
    const rows = data.values || [];
    
    // Get the second row (index 1) which contains the actual values, not the header row
    const statsRow = rows[1] || [];
    console.log('Stats row:', statsRow);
    
    // Parse values more explicitly and ensure they are numbers
    const totalMembers = parseInt(statsRow[0]) || 0;
    const topScore = parseInt(statsRow[1]) || 0;
    const missionFinishers = parseInt(statsRow[2]) || 0;
    const totalComments = parseInt(statsRow[3]) || 0;
    const totalLikes = parseInt(statsRow[4]) || 0;
    
    const stats = {
      totalMembers: totalMembers > 0 ? totalMembers : 0,
      topScore: topScore > 0 ? topScore : 0,
      missionFinishers: missionFinishers > 0 ? missionFinishers : 0,
      totalComments: totalComments > 0 ? totalComments : 0,
      totalLikes: totalLikes > 0 ? totalLikes : 0,
    };
    
    console.log('Processed stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching stats data:', error);
    // Return default values on error
    return {
      totalMembers: 0,
      topScore: 0,
      missionFinishers: 0,
      totalComments: 0,
      totalLikes: 0,
    };
  }
};

// Generate avatar URL from name's first letter
const generateAvatarFromName = (name: string): string => {
  const firstLetter = name.charAt(0).toUpperCase();
  // Using a service that generates letter avatars with nice styling
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=fff&size=150&font-size=0.6&bold=true`;
};
