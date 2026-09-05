import { useEffect, useMemo, useState } from 'react';
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, startOfDay, startOfWeek, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, MousePointerClick, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { demoAdministrators, demoAdminShifts } from '../data/demoAdministrators';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'dk-admin-schedule-overrides-v1';
const TODAY = startOfDay(new Date());
const hours = Array.from({ length: 12 }, (_, index) => index + 9);
type ScheduleMap = Record<string, Record<string, number[]>>;

function loadSchedule(): ScheduleMap {
  const base: ScheduleMap = {};
  demoAdminShifts.forEach((shift) => {
    base[shift.date] ||= {};
    const selected = new Set<number>();
    shift.segments.forEach((segment) => {
      const [start, end] = segment.split('-').map((value) => Number(value.slice(0, 2)));
      for (let hour = start; hour < end; hour += 1) selected.add(hour);
    });
    base[shift.date][shift.adminId] = [...selected].sort((a, b) => a - b);
  });
  try { return { ...base, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return base; }
}

export default function AdminSchedule() {
  const [weekAnchor, setWeekAnchor] = useState(TODAY);
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const [schedule, setSchedule] = useState(loadSchedule);
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const administrators = selectedAdmin === 'all' ? demoAdministrators : demoAdministrators.filter((admin) => admin.id === selectedAdmin);
  const todayKey = format(TODAY, 'yyyy-MM-dd');
  const onDutyToday = useMemo(() => demoAdministrators.filter((admin) => (schedule[todayKey]?.[admin.id] || []).length), [schedule, todayKey]);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule)), [schedule]);

  const toggleHour = (date: string, adminId: string, hour: number) => setSchedule((current) => {
    const selected = new Set(current[date]?.[adminId] || []);
    if (selected.has(hour)) selected.delete(hour); else selected.add(hour);
    return { ...current, [date]: { ...current[date], [adminId]: [...selected].sort((a, b) => a - b) } };
  });

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
      <div><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><h1 className="text-2xl font-bold tracking-tight">Расписание администраторов</h1></div><p className="mt-1 text-sm text-muted-foreground">Табель по часам: нажмите на ячейку, чтобы добавить или убрать рабочий час.</p></div>
      <div className="flex gap-2"><div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm"><Users className="h-4 w-4 text-emerald-600" /><span className="text-muted-foreground">Сегодня на смене</span><strong>{onDutyToday.length}</strong></div><Button variant="outline" size="sm" onClick={() => setWeekAnchor(TODAY)}>Сегодня</Button></div>
    </div>
    <Card className="overflow-hidden border-slate-300 shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-slate-100 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekAnchor((date) => subWeeks(date, 1))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekAnchor((date) => addWeeks(date, 1))}><ChevronRight className="h-4 w-4" /></Button><h2 className="ml-1 font-semibold">{format(weekStart, 'd MMMM', { locale: ru })} — {format(weekEnd, 'd MMMM yyyy', { locale: ru })}</h2></div>
        <Select value={selectedAdmin} onValueChange={setSelectedAdmin}><SelectTrigger className="h-9 w-[250px] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все администраторы</SelectItem>{demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="overflow-x-auto bg-white"><div className="min-w-[1540px] text-[10px]">
        <div className="grid border-b-2 border-slate-500" style={{ gridTemplateColumns: '150px repeat(7, 1fr)' }}>
          <div className="sticky left-0 z-20 flex items-end border-r-2 border-slate-500 bg-slate-100 p-2 font-semibold uppercase">Сотрудник</div>
          {weekDays.map((day) => <div key={day.toISOString()} className={cn('border-r border-slate-300 text-center last:border-r-0', day.getDay() === 0 && 'bg-fuchsia-100')}><div className={cn('border-b border-slate-300 py-1 font-semibold', isSameDay(day, TODAY) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50')}>{format(day, 'EEEEEE, dd.MM.yyyy', { locale: ru })}</div><div className="grid grid-cols-12">{hours.map((hour) => <span key={hour} className="border-r border-slate-200 py-1 last:border-r-0">{hour}</span>)}</div></div>)}
        </div>
        {administrators.map((admin, rowIndex) => <div key={admin.id} className="grid border-b border-slate-400" style={{ gridTemplateColumns: '150px repeat(7, 1fr)' }}>
          <div className="sticky left-0 z-10 flex min-h-12 items-center gap-2 border-r-2 border-slate-500 bg-slate-100 px-2"><Avatar className="h-7 w-7"><AvatarFallback className={cn('text-[9px] text-white', admin.accent)}>{admin.initials}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-xs font-semibold">{admin.name}</p><p className="truncate text-[9px] text-muted-foreground">{admin.role}</p></div></div>
          {weekDays.map((day) => { const dateKey = format(day, 'yyyy-MM-dd'); const selected = schedule[dateKey]?.[admin.id] || []; return <div key={dateKey} className={cn('grid grid-cols-12 border-r border-slate-300 last:border-r-0', day.getDay() === 0 && 'bg-fuchsia-50')}>{hours.map((hour) => { const active = selected.includes(hour); return <button key={hour} title={`${admin.name}: ${format(day, 'dd.MM')} ${hour}:00–${hour + 1}:00`} onClick={() => toggleHour(dateKey, admin.id, hour)} className={cn('min-h-12 border-r border-slate-200 text-center last:border-r-0 transition-colors hover:bg-emerald-200', active && (rowIndex % 3 === 0 ? 'bg-emerald-100' : rowIndex % 3 === 1 ? 'bg-sky-100' : 'bg-amber-100'))}>{active ? '1' : ''}</button>; })}</div>; })}
        </div>)}
      </div></div>
    </Card>
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MousePointerClick className="h-4 w-4" /><span>Клик по часу переключает его состояние. Изменения сохраняются автоматически.</span><Badge variant="outline">1 = рабочий час</Badge></div>
  </div>;
}
