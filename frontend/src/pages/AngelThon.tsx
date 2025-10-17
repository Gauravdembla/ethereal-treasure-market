import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import AngelicFooter from "@/components/AngelicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSectionToggles } from "@/hooks/angelthon/useSectionToggles";
import { useFacilitators } from "@/hooks/angelthon/useFacilitators";
import { useLeaderboardData } from "@/hooks/angelthon/useLeaderboardData";
import { Calendar, Clock, MapPin, Users, Trophy, Star, Award, User, FileText, Eye, EyeOff } from "lucide-react";

// Calendar Events Interface
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'workshop' | 'session' | 'meeting' | 'event';
  is_visible: boolean;
}

const AngelThon = () => {
  const { getToggleStatus, dataLoaded } = useSectionToggles();
  const { facilitators } = useFacilitators();
  const { data: leaderboardData } = useLeaderboardData();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Demo calendar events (in real app, this would come from database)
  useEffect(() => {
    const demoEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'AngelThon 7.0 Kickoff',
        description: 'Official launch event for AngelThon 7.0 with all participants',
        date: '2024-02-15',
        time: '10:00',
        location: 'Virtual - Zoom',
        attendees: 150,
        type: 'event',
        is_visible: true,
      },
      {
        id: 'event-2',
        title: 'Mindfulness Workshop',
        description: 'Guided meditation and mindfulness practices for participants',
        date: '2024-02-20',
        time: '14:00',
        location: 'Community Center',
        attendees: 50,
        type: 'workshop',
        is_visible: true,
      },
      {
        id: 'event-3',
        title: 'Team Building Session',
        description: 'Interactive team building activities and networking',
        date: '2024-02-25',
        time: '16:00',
        location: 'Conference Room A',
        attendees: 30,
        type: 'session',
        is_visible: true,
      }
    ];
    setCalendarEvents(demoEvents);
  }, []);

  // Get section statuses
  const facilitatorsEnabled = getToggleStatus('facilitators');
  const achievementsEnabled = getToggleStatus('achievements');
  const resourcesEnabled = getToggleStatus('resources');
  const calendarEnabled = getToggleStatus('calendar');

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'session': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state while section toggles are loading
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">AngelThon 7.0</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <AngelicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4 text-gray-800">
            AngelThon 7.0
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us in this transformative journey of personal growth, mindfulness, and community building.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        
        {/* Leaderboard Section - Always visible */}
        {leaderboardData && leaderboardData.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Leaderboard</h2>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center justify-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Top Performers
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {leaderboardData.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Star className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                        {index > 2 && <span className="text-sm font-bold text-gray-600">#{index + 1}</span>}
                      </div>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800">{member.name}</h4>
                        {member.badges && member.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {member.badges.slice(0, 2).map((badge, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-800">
                        {member.points.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Calendar Section */}
        {calendarEnabled && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Upcoming Events</h2>
            <div className="grid gap-6 max-w-4xl mx-auto">
              {calendarEvents.filter(event => event.is_visible).map((event) => (
                <Card key={event.id} className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.attendees > 0 && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} expected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {calendarEvents.filter(event => event.is_visible).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Facilitators Section */}
        {facilitatorsEnabled && facilitators.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Our Facilitators</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {facilitators.filter(f => f.is_visible).map((facilitator) => (
                <Card key={facilitator.id} className="bg-white/70 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <img
                      src={facilitator.image || '/placeholder.svg'}
                      alt={facilitator.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{facilitator.name}</h3>
                    <p className="text-purple-600 font-medium mb-3">{facilitator.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{facilitator.bio}</p>
                    
                    {facilitator.expertise && facilitator.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 justify-center">
                        {facilitator.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Resources Section */}
        {resourcesEnabled && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Resources</h2>
            <div className="text-center py-8 text-gray-500 max-w-2xl mx-auto">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Learning resources and materials will be available here.</p>
            </div>
          </section>
        )}

        {/* Achievements Section */}
        {achievementsEnabled && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Achievements</h2>
            <div className="text-center py-8 text-gray-500 max-w-2xl mx-auto">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Achievement badges and milestones will be displayed here.</p>
            </div>
          </section>
        )}

      </div>

      <AngelicFooter />
    </div>
  );
};

export default AngelThon;
