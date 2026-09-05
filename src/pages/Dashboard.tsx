import { useMemo } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { demoAdministrators, demoAdminTasks, getShift, getShiftHours, type DemoBoardTask } from '../data/demoAdministrators';
import { importedStudents } from '../data/importedStudents';
import { useCurrentUser } from '../hooks/use-auth';

const TASKS_KEY = 'dk-admin-kanban-v1';
const TODAY = new Date();
const TODAY_KEY = format(TODAY, 'yyyy-MM-dd');

function loadTasks(): DemoBoardTask[] {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || 'null') || demoAdminTasks; } catch { return demoAdminTasks; }
}

const teamSchedule = [
  { time: '10:00', title: 'Открытый урок немецкого A1', place: 'Кабинет 3' },
  { time: '15:30', title: 'Разговорный клуб: Berlin', place: 'Большой зал' },
  { time: '19:00', title: 'Знакомство с преподавателями', place: 'Онлайн' },
];

export default function Dashboard() {
  const { user, userId } = useCurrentUser();
  const adminIndex = useMemo(() => {
    const byName = demoAdministrators.findIndex((admin) => user?.fullName?.includes(admin.shortName));
    if (byName >= 0) return byName;
    return [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % demoAdministrators.length;
  }, [user?.fullName, userId]);
  const admin = demoAdministrators[adminIndex];
  const tasks = loadTasks();
  const personalTasks = tasks.filter((task) => task.status !== 'completed' && task.assigneeId === admin.id).slice(0, 5);
  const displayedTasks = personalTasks.length ? personalTasks : tasks.filter((task) => task.status !== 'completed').slice(adminIndex * 2, adminIndex * 2 + 4);
  const attentionClients = importedStudents.slice(adminIndex * 4, adminIndex * 4 + 4);
  const shift = getShift(admin.id, TODAY_KEY);
  const firstName = user?.fullName?.split(' ')[1] || user?.fullName?.split(' ')[0] || admin.shortName;
  const weekStart = startOfWeek(TODAY, { weekStartsOn: 1 });
  const weekPlan = Array.from({ length: 6 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dayShift = getShift(admin.id, format(date, 'yyyy-MM-dd'));
    return { date, shift: dayShift, hours: getShiftHours(dayShift) };
  });
  const weeklyHours = weekPlan.reduce((sum, day) => sum + day.hours, 0);
  const weeklyProgress = Math.min(100, Math.round((weeklyHours / 40) * 100));

  return <div className="-m-6 min-h-[calc(100vh-4rem)] bg-[#f5f4f2] p-6 lg:-m-8 lg:p-8">
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge variant="outline" className="mb-3 rounded-full border-white bg-white/80 px-3 py-1 text-slate-500 shadow-sm">{format(TODAY, 'EEEE, d MMMM', { locale: ru })}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Добрый день, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">Спокойная сводка по вашему дню — важное уже собрано здесь.</p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5">
        <Avatar className="h-10 w-10"><AvatarFallback className={`${admin.accent} text-xs text-white`}>{admin.initials}</AvatarFallback></Avatar>
        <div><p className="text-sm font-medium">{admin.name}</p><p className="text-xs text-slate-500">{shift ? `Сегодня ${shift.segments.join(', ').replace(/-/g, '–')}` : 'Сегодня без смены'}</p></div>
      </div>
    </div>

    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      {[{ label: 'Новые клиенты', value: 12, note: '+4 за неделю', icon: UserRound, tone: 'bg-rose-50 text-rose-600' }, { label: 'Занятий сегодня', value: 18, note: '6 онлайн · 12 очно', icon: CalendarDays, tone: 'bg-sky-50 text-sky-600' }, { label: 'Активные группы', value: 27, note: '3 готовятся к старту', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' }].map((item) => <Card key={item.label} className="rounded-3xl border-0 bg-white/85 shadow-sm ring-1 ring-black/5"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-semibold text-slate-900">{item.value}</p><p className="mt-1 text-xs text-slate-400">{item.note}</p></div><div className={`rounded-2xl p-3 ${item.tone}`}><item.icon className="h-5 w-5" /></div></CardContent></Card>)}
    </div>

    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.35fr_1fr]">
      <Card className="rounded-3xl border-0 bg-white/90 shadow-sm ring-1 ring-black/5">
        <CardHeader className="flex-row items-center justify-between pb-3"><CardTitle className="text-base">Задачи на сегодня</CardTitle><Badge className="rounded-full bg-slate-900">{displayedTasks.length}</Badge></CardHeader>
        <CardContent className="space-y-2">
          {displayedTasks.length ? displayedTasks.map((task) => <Link to="/tasks" key={task.id} className="group flex items-start gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100"><CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-300 group-hover:text-emerald-500" /><div className="min-w-0"><p className="text-sm font-medium leading-snug">{task.title}</p><p className="mt-1 text-xs text-slate-400">{task.dueDate === TODAY_KEY ? 'Сегодня' : task.dueDate}</p></div></Link>) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">На сегодня всё чисто. Редкая птица, наслаждайтесь.</p>}
          <Button asChild variant="ghost" className="mt-2 w-full justify-between rounded-xl text-slate-500"><Link to="/tasks">Открыть доску <ArrowRight className="h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-white/90 shadow-sm ring-1 ring-black/5">
        <CardHeader className="pb-3"><CardTitle className="text-base">Клиенты, которые требуют внимания</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {attentionClients.map((student, index) => <Link to="/students" key={student.id} className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-slate-50"><Avatar className="h-10 w-10"><AvatarFallback className="bg-[#ece9e5] text-xs text-slate-600">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{student.name}</p><p className="truncate text-xs text-slate-400">{index % 2 ? 'Уточнить готовность и формат занятий' : `До предполагаемого старта ${5 + index} дней`}</p></div><Badge variant="outline" className="rounded-full bg-amber-50 text-[10px] text-amber-700">Внимание</Badge></Link>)}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="rounded-3xl border-0 bg-[#e8ece9] shadow-sm ring-1 ring-black/5"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-4 w-4" />Расписание на сегодня</CardTitle></CardHeader><CardContent className="space-y-2">{shift ? shift.segments.map((segment) => <div key={segment} className="rounded-2xl bg-white/65 px-3 py-2 text-sm"><span className="font-medium">{segment.replace('-', '–')}</span><span className="ml-2 text-xs text-slate-500">рабочая смена</span></div>) : <p className="text-sm text-slate-500">Сегодня выходной</p>}<p className="pt-2 text-xs text-slate-500">Команда: 18 занятий · 3 консультации</p></CardContent></Card>
        <Card className="rounded-3xl border-0 bg-[#eee9e3] shadow-sm ring-1 ring-black/5"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4" />Ближайшие мероприятия</CardTitle></CardHeader><CardContent className="space-y-3">{teamSchedule.map((event) => <div key={event.title} className="border-b border-black/5 pb-3 last:border-0 last:pb-0"><p className="text-sm font-medium">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.time} · {event.place}</p></div>)}</CardContent></Card>
      </div>
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
      <Card className="rounded-3xl border-0 bg-white/90 shadow-sm ring-1 ring-black/5">
        <CardHeader className="pb-3"><CardTitle className="text-base">Мой план недели</CardTitle><p className="mt-1 text-xs text-slate-400">Рабочие часы и ритм смен</p></CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {weekPlan.map((day) => <div key={day.date.toISOString()} className="flex min-w-0 flex-col items-center rounded-2xl bg-[#f7f6f4] px-2 py-3">
              <span className="text-[10px] font-medium uppercase text-slate-400">{format(day.date, 'EEEEEE', { locale: ru })}</span>
              <div className="my-3 flex h-20 w-3 items-end overflow-hidden rounded-full bg-slate-200"><div className="w-full rounded-full bg-gradient-to-t from-[#c9bcae] to-[#a8bdb4] transition-all" style={{ height: `${Math.max(day.hours ? 18 : 0, Math.min(100, day.hours * 11))}%` }} /></div>
              <span className="text-sm font-semibold text-slate-700">{day.hours ? `${day.hours} ч.` : '—'}</span>
              <span className="mt-1 max-w-full truncate text-[9px] text-slate-400">{day.shift?.segments[0]?.replace('-', '–') || 'выходной'}</span>
            </div>)}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-0 bg-[#eeece8] shadow-sm ring-1 ring-black/5">
        <CardHeader className="pb-0"><CardTitle className="text-base">Нагрузка недели</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center pt-2">
          <div className="relative h-32 w-64 overflow-hidden">
            <svg viewBox="0 0 240 130" className="h-full w-full" aria-label={`Недельная нагрузка ${weeklyProgress}%`}>
              <path d="M 20 118 A 100 100 0 0 1 220 118" fill="none" stroke="#dedbd6" strokeWidth="20" strokeLinecap="round" />
              <path d="M 20 118 A 100 100 0 0 1 220 118" fill="none" stroke="url(#weekLoad)" strokeWidth="20" strokeLinecap="round" pathLength="100" strokeDasharray={`${weeklyProgress} 100`} />
              <defs><linearGradient id="weekLoad" x1="0" x2="1"><stop stopColor="#d8b9ad" /><stop offset="0.55" stopColor="#d8cd9f" /><stop offset="1" stopColor="#9ebcad" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center"><p className="text-3xl font-semibold text-slate-800">{weeklyHours}<span className="text-base font-normal text-slate-400"> / 40 ч.</span></p><p className="text-[11px] text-slate-400">запланировано</p></div>
          </div>
          <div className="mt-3 grid w-full grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white/60 p-3"><p className="text-slate-400">Рабочих дней</p><p className="mt-1 text-lg font-semibold">{weekPlan.filter((day) => day.hours).length}</p></div><div className="rounded-xl bg-white/60 p-3"><p className="text-slate-400">Средняя смена</p><p className="mt-1 text-lg font-semibold">{weeklyHours ? Math.round(weeklyHours / Math.max(1, weekPlan.filter((day) => day.hours).length)) : 0} ч.</p></div></div>
        </CardContent>
      </Card>
    </div>
    <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-lg"><UsersRound className="h-4 w-4 text-emerald-300" /><span><strong>Команда:</strong> сегодня закрыто 14 задач, три запуска подготовлены без переносов.</span></div>
  </div>;
}
