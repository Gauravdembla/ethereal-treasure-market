
interface AchievementData {
  userId: string;
  userName: string;
  email: string;
  points: number;
  badges: string[];
  rank: number;
  callsAttended: number;
  totalCalls: number;
  lastActivity: string;
  weeklyProgress: {
    week: string;
    points: number;
  }[];
  recentActivities: {
    date: string;
    activity: string;
    points: number;
  }[];
}

export class AchievementsService {
  private static SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:json';
  
  static async fetchAchievements(): Promise<AchievementData[]> {
    try {
      console.log('Fetching achievements from Google Sheets...');
      
      // This would be the actual Google Sheets API call
      // For now, returning mock data
      const mockData: AchievementData[] = [
        {
          userId: "user1",
          userName: "John Doe",
          email: "john@example.com",
          points: 2450,
          badges: ["First Step", "Consistent", "Community Helper"],
          rank: 5,
          callsAttended: 12,
          totalCalls: 15,
          lastActivity: "2025-01-02",
          weeklyProgress: [
            { week: "Week 1", points: 320 },
            { week: "Week 2", points: 450 },
            { week: "Week 3", points: 380 },
            { week: "Week 4", points: 290 },
            { week: "Current", points: 180 }
          ],
          recentActivities: [
            { date: "2025-01-02", activity: "Attended morning call", points: 50 },
            { date: "2025-01-01", activity: "Completed daily reflection", points: 30 },
            { date: "2024-12-31", activity: "Helped a community member", points: 25 },
            { date: "2024-12-30", activity: "Shared success story", points: 40 }
          ]
        }
      ];
      
      return mockData;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }
  
  static async syncWithGoogleSheets(sheetUrl: string, apiKey: string): Promise<boolean> {
    try {
      console.log('Syncing with Google Sheets:', sheetUrl);
      
      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL');
      }
      
      const sheetId = sheetIdMatch[1];
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch data from Google Sheets');
      }
      
      console.log('Successfully synced with Google Sheets');
      return true;
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error);
      return false;
    }
  }
  
  static async updateUserAchievement(userId: string, achievementData: Partial<AchievementData>): Promise<boolean> {
    try {
      console.log('Updating user achievement:', userId, achievementData);
      
      // This would update the Google Sheet via API
      // For now, just log the operation
      console.log('Achievement updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating achievement:', error);
      return false;
    }
  }
}
