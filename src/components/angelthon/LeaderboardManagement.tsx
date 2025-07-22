
import { Trophy, Medal, Award, Star, TrendingUp, Search, ArrowLeft, Crown, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useLeaderboardData } from "@/hooks/angelthon/useLeaderboardData";
import { LeaderboardMember } from "@/services/secureGoogleSheetsService";

// MemberCard Component
const MemberCard = ({ member, isTop3 }: { member: LeaderboardMember; isTop3: boolean }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <div className="flex items-center justify-center w-8 h-8">
          {getRankIcon(member.rank)}
        </div>

        {/* Avatar */}
        <img
          src={member.avatar}
          alt={member.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />

        {/* Member Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-800">{member.name}</h3>
            {member.level && (
              <Badge className={getLevelColor(member.level)}>
                {member.level}
              </Badge>
            )}
          </div>

          {/* Badges */}
          {member.badges && member.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {member.badges.slice(0, 3).map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
              {member.badges.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.badges.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Points and Growth */}
      <div className="text-right">
        <div className="flex items-center space-x-2 mb-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-bold text-lg text-gray-800">
            {member.points.toLocaleString()}
          </span>
        </div>

        {member.weeklyGrowth !== undefined && member.weeklyGrowth > 0 && (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-medium">+{member.weeklyGrowth}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const LeaderboardManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  
  const { data: leaderboardData = [], isLoading, error } = useLeaderboardData();
  
  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return leaderboardData;
    return leaderboardData.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, leaderboardData]);
  
  // Get members limited by visible count when not searching
  const visibleMembers = useMemo(() => {
    return searchTerm ? filteredMembers : filteredMembers.slice(0, visibleCount);
  }, [filteredMembers, visibleCount, searchTerm]);
  
  const hasMoreMembers = !searchTerm && visibleCount < leaderboardData.length;
  
  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, leaderboardData.length));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p className="text-base sm:text-lg text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-red-600">Failed to load leaderboard data</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Please check your Google Sheets configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AngelThon Leaderboard</h2>
          <p className="text-gray-600">View and manage leaderboard rankings</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 rounded-lg p-6">
        {/* Header with Search */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-yellow-500 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              AngelThon 7.0<br />Leaderboard
            </h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/70 backdrop-blur-sm border-white/50"
            />
          </div>
        </div>

        {/* Show search results message if searching */}
        {searchTerm && (
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Found {filteredMembers.length} member(s) matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Rankings */}
        {visibleMembers.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Medal className="h-5 w-5 mr-2" />
                {searchTerm ? "Search Results" : "AngelThon 7.0 Points"}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {visibleMembers.map((member, index) => (
                <MemberCard key={member.id} member={member} isTop3={false} />
              ))}
            </div>
          </div>
        )}

        {/* Show More Button */}
        {hasMoreMembers && (
          <div className="text-center">
            <Button 
              onClick={handleShowMore}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Show More ({Math.min(10, leaderboardData.length - visibleCount)} more members)
            </Button>
          </div>
        )}

        {/* No results message */}
        {searchTerm && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No members found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Empty state */}
        {leaderboardData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No leaderboard data available</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Please check your Google Sheets configuration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardManagement;
