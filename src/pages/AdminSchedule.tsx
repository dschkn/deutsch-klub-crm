import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Heart,
  Plane,
  User,
  Plus,
} from 'lucide-react';
import { users } from '../data/sampleData';
import { format, startOfMonth, addDays, subMonths, addMonths, isSameDay, isSameMonth, startOfWeek, getDay } from 'date-fns';

const administrators = users.filter(u => u.role === 'administrator' || u.role === 'manager');

interface Shift {
  id: string;
  userId: string;
  date: Date;
  type: 'morning' | 'afternoon' | 'full';
  status: 'scheduled' | 'completed';
}

interface TimeOff {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  type: 'vacation' | 'sick' | 'personal';
  status: 'approved' | 'pending' | 'rejected';
}

const initialShifts: Shift[] = administrators.flatMap(admin => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i - 15);
    if (Math.random() > 0.3 && getDay(date) !== 0 && getDay(date) !== 6) {
      return {
        id: `${admin.id}-${i}`,
        userId: admin.id,
        date,
        type: randomElement(['morning', 'afternoon', 'full']),
        status: date < today ? 'completed' as const : 'scheduled' as const,
      };
    }
    return null;
  }).filter(Boolean);
}) as Shift[];

const initialTimeOff: TimeOff[] = [
  { id: 'to1', userId: users[8].id, startDate: addDays(new Date(), 14), endDate: addDays(new Date(), 18), type: 'vacation', status: 'approved' },
  { id: 'to2', userId: users[9].id, startDate: addDays(new Date(), 7), endDate: addDays(new Date(), 8), type: 'sick', status: 'approved' },
  { id: 'to3', userId: users[3].id, startDate: addDays(new Date(), 21), endDate: addDays(new Date(), 25), type: 'vacation', status: 'pending' },
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AdminSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts] = useState(initialShifts);
  const [timeOff] = useState(initialTimeOff);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  const monthStart = startOfMonth(currentMonth);
  const monthStartDay = startOfWeek(monthStart, { weekStartsOn: 1 });
  const daysInMonth = [];

  let day = monthStartDay;
  for (let i = 0; i < 42; i++) {
    daysInMonth.push(day);
    day = addDays(day, 1);
  }

  const handlePrevious = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNext = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const staffToShow = selectedStaff === 'all'
    ? administrators
    : administrators.filter(a => a.id === selectedStaff);

  const getShiftForDay = (userId: string, date: Date): Shift | undefined => {
    return shifts.find(s => s.userId === userId && isSameDay(s.date, date));
  };

  const getTimeOffForDay = (userId: string, date: Date): TimeOff | undefined => {
    return timeOff.find(t =>
      t.userId === userId &&
      date >= t.startDate &&
      date <= t.endDate
    );
  };

  const shiftColors: Record<Shift['type'], string> = {
    morning: 'bg-amber-100 text-amber-800 border-amber-200',
    afternoon: 'bg-blue-100 text-blue-800 border-blue-200',
    full: 'bg-green-100 text-green-800 border-green-200',
  };

  const timeOffColors: Record<TimeOff['type'], string> = {
    vacation: 'bg-purple-100 text-purple-800 border-purple-200',
    sick: 'bg-red-100 text-red-800 border-red-200',
    personal: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const timeOffIcons: Record<TimeOff['type'], React.ReactNode> = {
    vacation: <Plane className="h-3 w-3" />,
    sick: <Heart className="h-3 w-3" />,
    personal: <User className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrator Schedule</h1>
          <p className="text-muted-foreground">Staff scheduling, shifts, and time-off management</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Time Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {administrators.map(admin => (
                      <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Sun className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Duty Today</p>
                <p className="text-2xl font-bold">{shifts.filter(s => isSameDay(s.date, new Date())).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Plane className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Vacation</p>
                <p className="text-2xl font-bold">{timeOff.filter(t => new Date() >= t.startDate && new Date() <= t.endDate && t.type === 'vacation').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sick Leave</p>
                <p className="text-2xl font-bold">{timeOff.filter(t => new Date() >= t.startDate && new Date() <= t.endDate && t.type === 'sick').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{timeOff.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-4">{format(currentMonth, 'MMMM yyyy')}</h2>
        </div>

        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {administrators.map(admin => (
              <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-sm text-muted-foreground bg-muted">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {daysInMonth.map((date, i) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, new Date());
              const isWeekend = getDay(date) === 0 || getDay(date) === 6;

              return (
                <div
                  key={i}
                  className={`min-h-[120px] border-b border-r p-2 ${!isCurrentMonth ? 'bg-muted' : ''} ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-muted-foreground' : isToday ? 'text-blue-700' : 'text-foreground'}`}>
                      {format(date, 'd')}
                    </span>
                  </div>
                  {isCurrentMonth && !isWeekend && (
                    <div className="space-y-1">
                      {staffToShow.slice(0, 4).map(staff => {
                        const shift = getShiftForDay(staff.id, date);
                        const timeOffEntry = getTimeOffForDay(staff.id, date);

                        if (timeOffEntry) {
                          return (
                            <div
                              key={staff.id}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${timeOffColors[timeOffEntry.type]}`}
                            >
                              {timeOffIcons[timeOffEntry.type]}
                              <span className="truncate">{staff.name.split(' ')[0]}</span>
                            </div>
                          );
                        }

                        if (shift) {
                          return (
                            <div
                              key={staff.id}
                              className={`px-1.5 py-0.5 rounded text-xs ${shiftColors[shift.type]}`}
                              title={`${staff.name} - ${shift.type} shift`}
                            >
                              <span className="truncate">{staff.name.split(' ')[0]}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                      {staffToShow.length > 4 && (
                        <div className="text-xs text-muted-foreground">+{staffToShow.length - 4} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-amber-100 border border-amber-200" />
          <span>Morning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-blue-100 border border-blue-200" />
          <span>Afternoon</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-100 border border-green-200" />
          <span>Full Day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-purple-100 border border-purple-200" />
          <span>Vacation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-100 border border-red-200" />
          <span>Sick</span>
        </div>
      </div>
    </div>
  );
}
