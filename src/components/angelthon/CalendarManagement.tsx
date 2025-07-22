import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSectionToggles } from "@/hooks/angelthon/useSectionToggles";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, Users, Settings, Eye, EyeOff } from "lucide-react";

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
  created_at: string;
  updated_at: string;
}

const CalendarManagement = () => {
  const { getToggleStatus, updateToggle } = useSectionToggles();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendees: 0,
    type: 'event' as const,
    is_visible: true
  });

  const calendarSectionEnabled = getToggleStatus('calendar');

  // Demo events data
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'event-3',
        title: 'Facilitator Meeting',
        description: 'Monthly facilitator coordination and planning meeting',
        date: '2024-02-25',
        time: '16:00',
        location: 'Conference Room A',
        attendees: 12,
        type: 'meeting',
        is_visible: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setEvents(demoEvents);
  }, []);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      const eventToAdd: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...newEvent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEvents(prev => [...prev, eventToAdd]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        attendees: 0,
        type: 'event',
        is_visible: true
      });
      setIsAddEventOpen(false);

      toast({
        title: "Success",
        description: "Event added successfully"
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add event"
      });
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent) return;

    try {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...editingEvent, updated_at: new Date().toISOString() }
          : event
      ));
      setEditingEvent(null);

      toast({
        title: "Success",
        description: "Event updated successfully"
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event"
      });
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to remove this event?')) {
      try {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast({
          title: "Success",
          description: "Event removed successfully"
        });
      } catch (error) {
        console.error('Error removing event:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove event"
        });
      }
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calendar Management</h2>
          <p className="text-gray-600">Manage AngelThon events and schedule</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Section Enabled:</span>
            <Switch
              checked={calendarSectionEnabled}
              onCheckedChange={(checked) => updateToggle('calendar', checked)}
            />
          </div>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new calendar event for AngelThon 7.0.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <select
                      id="type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="event">Event</option>
                      <option value="workshop">Workshop</option>
                      <option value="session">Session</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendees">Expected Attendees</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newEvent.is_visible}
                    onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label>Visible on Frontend</Label>
                </div>

                <Button onClick={handleAddEvent} className="w-full">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Calendar Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start justify-between p-4 bg-white/50 rounded-lg border border-white/30">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                    {event.is_visible ? 
                      <Eye className="h-4 w-4 text-green-600" /> : 
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.attendees > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingEvent(event)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveEvent(event.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No events scheduled yet. Click "Add Event" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event information below.
              </DialogDescription>
            </DialogHeader>
            {/* Similar form structure as add event, but with editingEvent values */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Event Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Event Type</Label>
                  <select
                    id="edit-type"
                    value={editingEvent.type}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="event">Event</option>
                    <option value="workshop">Workshop</option>
                    <option value="session">Session</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, date: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time *</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, time: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, location: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-attendees">Expected Attendees</Label>
                  <Input
                    id="edit-attendees"
                    type="number"
                    value={editingEvent.attendees}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, attendees: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingEvent.is_visible}
                  onCheckedChange={(checked) => setEditingEvent(prev => prev ? { ...prev, is_visible: checked } : null)}
                />
                <Label>Visible on Frontend</Label>
              </div>

              <Button onClick={handleEditEvent} className="w-full">
                Update Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarManagement;
