import { useMemo, useState } from 'react';
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { demoAdministrators, getShift, getShiftHours } from '../data/demoAdministrators';
import { cn } from '../lib/utils';

const DEMO_TODAY = parseISO('2026-08-19');

export default function AdminSchedule() {
  const [weekAnchor, setWeekAnchor] = useState(DEMO_TODAY);
  const [selectedAdmin, setSelectedAdmin] = useState('all');
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const administrators = selectedAdmin === 'all' ? demoAdministrators : demoAdministrators.filter((admin) => admin.id === selectedAdmin);
  const todayKey = format(DEMO_TODAY, 'yyyy-MM-dd');
  const onDutyToday = useMemo(() => demoAdministrators.filter((admin) => getShift(admin.id, todayKey)), [todayKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Расписание администраторов</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Рабочие интервалы перенесены из актуального графика, имена заменены на вымышленные.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">Сегодня на смене</span>
            <strong>{onDutyToday.length}</strong>
          </div>
          <Button variant="outline" size="sm" onClick={() => setWeekAnchor(DEMO_TODAY)}>Сегодня</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekAnchor((date) => subWeeks(date, 1))} aria-label="Предыдущая неделя"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekAnchor((date) => addWeeks(date, 1))} aria-label="Следующая неделя"><ChevronRight className="h-4 w-4" /></Button>
            <h2 className="ml-1 text-sm font-semibold sm:text-base">{format(weekStart, 'd MMMM', { locale: ru })} — {format(weekEnd, 'd MMMM yyyy', { locale: ru })}</h2>
          </div>
          <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
            <SelectTrigger className="h-9 w-full bg-background sm:w-[250px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все администраторы</SelectItem>
              {demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1260px]">
            <div className="grid border-b bg-muted/40" style={{ gridTemplateColumns: '220px repeat(7, minmax(145px, 1fr))' }}>
              <div className="sticky left-0 z-10 flex items-end border-r bg-muted/40 p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Сотрудник</div>
              {weekDays.map((day) => {
                const isToday = isSameDay(day, DEMO_TODAY);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div key={day.toISOString()} className={cn('border-r p-3 text-center last:border-r-0', isWeekend && 'bg-slate-100/70', isToday && 'bg-emerald-50')}>
                    <div className="text-xs font-medium uppercase text-muted-foreground">{format(day, 'EEEEEE', { locale: ru })}</div>
                    <div className={cn('mt-0.5 text-base font-semibold', isToday && 'text-emerald-700')}>{format(day, 'd MMM', { locale: ru })}</div>
                    {isToday && <Badge className="mt-1 h-5 bg-emerald-100 px-1.5 text-[10px] text-emerald-800 hover:bg-emerald-100">Сегодня</Badge>}
                  </div>
                );
              })}
            </div>

            {administrators.map((admin) => {
              const weeklyHours = weekDays.reduce((total, day) => total + getShiftHours(getShift(admin.id, format(day, 'yyyy-MM-dd'))), 0);
              return (
                <div key={admin.id} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: '220px repeat(7, minmax(145px, 1fr))' }}>
                  <div className="sticky left-0 z-10 flex min-h-24 items-center gap-3 border-r bg-background p-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className={cn('text-xs font-semibold text-white', admin.accent)}>{admin.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{admin.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{admin.role}</p>
                      <p className="mt-1 text-[11px] font-medium text-primary">{weeklyHours} ч. за неделю</p>
                    </div>
                  </div>
                  {weekDays.map((day) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const shift = getShift(admin.id, dateKey);
                    const isToday = isSameDay(day, DEMO_TODAY);
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div key={dateKey} className={cn('min-h-24 border-r p-2 last:border-r-0', isWeekend && 'bg-slate-50/70', isToday && 'bg-emerald-50/50')}>
                        {shift ? (
                          <div className={cn('h-full rounded-lg border border-primary/20 bg-primary/5 p-2', isToday && 'border-emerald-300 bg-emerald-100/70')}>
                            <div className="mb-1.5 flex items-center justify-between"><span className={cn('text-[11px] font-semibold uppercase text-primary', isToday && 'text-emerald-800')}>Смена</span><span className="text-[11px] text-muted-foreground">{getShiftHours(shift)} ч.</span></div>
                            <div className="space-y-1">
                              {shift.segments.map((segment) => <div key={segment} className="flex items-center gap-1.5 text-xs font-medium"><Clock3 className="h-3 w-3 text-muted-foreground" />{segment.replace('-', '–')}</div>)}
                            </div>
                          </div>
                        ) : <div className="flex h-full min-h-20 items-center justify-center text-xs text-muted-foreground/70">Выходной</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-primary/30 bg-primary/10" /> Рабочая смена</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-100" /> Выходной</span>
        <span>Перерыв между интервалами не входит в рабочие часы.</span>
      </div>
    </div>
  );
}
