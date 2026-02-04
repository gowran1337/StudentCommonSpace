import { useState, useEffect } from 'react';
import { calendarEventsApi, type CalendarEvent } from '../services/api';

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
const MONTHS = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];

const EVENT_COLORS = [
  { name: 'Blå', value: 'bg-blue-500' },
  { name: 'Grön', value: 'bg-green-500' },
  { name: 'Röd', value: 'bg-red-500' },
  { name: 'Lila', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
];

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [color, setColor] = useState('bg-blue-500');

  useEffect(() => {
    loadEvents();
    
    // Subscribe to realtime updates
    const channel = calendarEventsApi.subscribe((event, eventType) => {
      if (eventType === 'INSERT') {
        setEvents(prev => [...prev, event].sort((a, b) => 
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ));
      } else if (eventType === 'UPDATE') {
        setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      } else if (eventType === 'DELETE') {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }
    });

    return () => {
      channel?.unsubscribe();
    };
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarEventsApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week (0 = Sunday, adjust for Monday start)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = event.start_date.split('T')[0];
      const eventEnd = event.end_date ? event.end_date.split('T')[0] : eventStart;
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const openCreateModal = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setStartDate(date.toISOString().split('T')[0]);
    setEndDate('');
    setAllDay(true);
    setColor('bg-blue-500');
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartDate(event.start_date.split('T')[0]);
    setEndDate(event.end_date ? event.end_date.split('T')[0] : '');
    setAllDay(event.all_day);
    setColor(event.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !startDate) return;

    try {
      if (editingEvent) {
        await calendarEventsApi.update(editingEvent.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          start_date: startDate,
          end_date: endDate || undefined,
          all_day: allDay,
          color,
        });
      } else {
        await calendarEventsApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          start_date: startDate,
          end_date: endDate || undefined,
          all_day: allDay,
          color,
          flat_code: '', // Will be set by API
        });
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    
    try {
      await calendarEventsApi.delete(editingEvent.id);
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-white mb-6">📅 Kalender</h1>
      
      {/* Calendar Header */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            ← Föregående
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Idag
            </button>
          </div>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            Nästa →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-slate-700/50">
          {WEEKDAYS.map(day => (
            <div key={day} className="p-3 text-center text-slate-300 font-medium border-b border-slate-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] border-b border-r border-slate-700 p-2 ${
                day ? 'hover:bg-slate-700/50 cursor-pointer' : 'bg-slate-800/30'
              } ${day && isToday(day) ? 'bg-cyan-900/20' : ''}`}
              onClick={() => day && openCreateModal(day)}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) ? 'text-cyan-400' : 'text-slate-300'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        className={`${event.color} text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(day).length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{getEventsForDate(day).length - 3} mer
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingEvent ? 'Redigera händelse' : 'Ny händelse'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Titel *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  placeholder="Händelsens namn..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">Beskrivning</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Valfri beskrivning..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Startdatum *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Slutdatum</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
                <label htmlFor="allDay" className="text-sm text-slate-300">Heldag</label>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">Färg</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full ${c.value} ${
                        color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Avbryt
              </button>
              {editingEvent && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Ta bort
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!title.trim() || !startDate}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingEvent ? 'Spara' : 'Skapa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
