import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  Users,
  CreditCard,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
  BarChart,
} from 'recharts';
import { getRevenueByMonth, getRetentionData, allStudents, allTasks } from '../data/sampleData';
import { DataStore } from '../data/store';

const CHART_RESIZE_DEBOUNCE_MS = 120;
const revenueByMonth = getRevenueByMonth();
const retentionData = getRetentionData();
const recentStudents = allStudents.slice(0, 5);
const todayTasks = allTasks.filter((task) => task.status !== 'completed').slice(0, 5);

const todaySchedule = [
  { time: '09:00', endTime: '10:30', name: 'Berlin A1', subject: 'Немецкий', room: 'Каб. 1', color: 'blue' },
  { time: '11:00', endTime: '12:30', name: 'Cambridge B1', subject: 'Английский', room: 'Каб. 2', color: 'mint' },
  { time: '18:00', endTime: '19:30', name: 'Munich B2', subject: 'Немецкий', room: 'Онлайн', color: 'violet' },
];

const scheduleColorMap: Record<string, { bg: string; border: string; time: string; timeDark: string }> = {
  blue: { bg: 'bg-[#edf2ff]', border: 'border-[#dce5ff]', time: 'text-slate-900', timeDark: 'text-slate-500' },
  mint: { bg: 'bg-[#eaf8f3]', border: 'border-[#d7eee5]', time: 'text-slate-900', timeDark: 'text-slate-500' },
  violet: { bg: 'bg-[#f2edff]', border: 'border-[#e5dcfb]', time: 'text-slate-900', timeDark: 'text-slate-500' },
};

export default function Dashboard() {
  const store = DataStore.getInstance();
  const activeStudents = store.getAllStudents().filter((student) => student.status === 'active').length;
  const overduePayments = store.getAllPayments().filter((payment) => payment.status === 'overdue').length;
  const today = new Date();
  const todayLessons = store.getAllScheduleItems().filter((scheduleItem) => {
    const date = new Date(scheduleItem.start);
    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }).length;

  const kpi = {
    activeStudents,
    monthlyRevenue: store.getAllPayments()
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 500000,
    overduePayments,
    upcomingLessons: todayLessons || 3,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="tracking-tight">Главная</h1>
          <p className="mt-1 text-muted-foreground">Добро пожаловать, Елена. Вот что происходит сегодня.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full bg-white px-5">
            Скачать отчёт
          </Button>
          <Button className="gap-2 rounded-full px-5">
            <Calendar className="h-4 w-4" />
            Сегодня
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="overflow-hidden border-[#dce5ff] bg-[#edf2ff] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Активные клиенты</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{kpi.activeStudents}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-2.5 text-slate-800 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-slate-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+8 за неделю</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#d7eee5] bg-[#eaf8f3] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Выручка за месяц</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">€{(kpi.monthlyRevenue / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-2.5 text-slate-800 shadow-sm">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-slate-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              <span>+5% за месяц</span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-[#f0e4c7] bg-[#fff7e3] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Просроченные оплаты</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{kpi.overduePayments}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-2.5 text-slate-800 shadow-sm">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-slate-500">
              <ArrowDownRight className="mr-1 h-4 w-4" />
              <span>Требует внимания</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 overflow-hidden border-[#e5dcfb] bg-[#f2edff] shadow-none lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Занятий сегодня</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{kpi.upcomingLessons}</p>
              </div>
              <div className="rounded-2xl bg-white/75 p-2.5 text-slate-800 shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-slate-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>3 завершено</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card/90 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Выручка по месяцам</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">Динамика выручки и количества клиентов</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} debounce={CHART_RESIZE_DEBOUNCE_MS}>
              <ComposedChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9EC" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `€${value / 1000}k`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E9EC',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#B9C8FF" radius={[7, 7, 0, 0]} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="students" name="Клиенты" stroke="#111827" strokeWidth={2} dot={{ fill: '#111827', r: 3 }} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Предстоящие задачи</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-muted-foreground">
                Все <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/55 p-3">
                  <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                    task.priority === 'urgent' ? 'bg-rose-400' :
                    task.priority === 'high' ? 'bg-orange-300' :
                    task.priority === 'medium' ? 'bg-amber-300' : 'bg-slate-300'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-[10px]">{task.assignee.name.split(' ').map((name) => name[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card/90 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Удержание клиентов по уровням</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">Процент клиентов, завершивших каждый уровень</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220} debounce={CHART_RESIZE_DEBOUNCE_MS}>
              <BarChart data={retentionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9EC" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#64748B', fontSize: 12 }} width={40} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E9EC',
                    borderRadius: '14px',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Удержание']}
                />
                <Bar dataKey="retention" fill="#B9C8FF" radius={[0, 7, 7, 0]} barSize={24} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Новые клиенты</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-muted-foreground">
                Все <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-900 text-sm text-white">
                      {student.name.split(' ').map((name) => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.language === 'German' ? 'Немецкий' : 'Английский'} — {student.currentLevel}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      student.status === 'active'
                        ? 'border-[#d7eee5] bg-[#eaf8f3] text-emerald-800'
                        : student.status === 'frozen'
                          ? 'border-[#f0e4c7] bg-[#fff7e3] text-amber-800'
                          : 'border-border bg-slate-50 text-muted-foreground'
                    }`}
                  >
                    {student.status === 'active' ? 'Активен' : student.status === 'frozen' ? 'Заморожен' : 'Неактивен'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/90">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Расписание на сегодня</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-muted-foreground">
              Календарь <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {todaySchedule.map((lesson) => {
              const colors = scheduleColorMap[lesson.color] || scheduleColorMap.blue;
              return (
                <div key={`${lesson.time}-${lesson.name}`} className={`flex gap-3 rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
                  <div className="w-14 flex-shrink-0 text-center">
                    <p className={`text-lg font-semibold ${colors.time}`}>{lesson.time}</p>
                    <p className={`text-xs ${colors.timeDark}`}>—{lesson.endTime}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lesson.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{lesson.subject}</span>
                      <span className="text-slate-300">•</span>
                      <MapPin className="h-3 w-3" />
                      <span>{lesson.room}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
