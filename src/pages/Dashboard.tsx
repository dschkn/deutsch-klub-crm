import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import {
  Users,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell,
  Line,
  Legend,
  BarChart,
} from 'recharts';
import { getLeadsBySource, getRevenueByMonth, getRetentionData, allStudents, allTasks, allEvents } from '../data/sampleData';
import { DataStore } from '../data/store';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const CHART_RESIZE_DEBOUNCE_MS = 120;

const leadsBySource = getLeadsBySource();
const revenueByMonth = getRevenueByMonth();
const retentionData = getRetentionData();
const recentStudents = allStudents.slice(0, 5);
const todayTasks = allTasks.filter(task => task.status !== 'completed').slice(0, 5);
const upcomingEvents = allEvents.filter(event => event.status === 'registration_open').slice(0, 4);

const todaySchedule = [
  { time: '09:00', endTime: '10:30', name: 'Berlin A1', subject: 'Немецкий', room: 'Каб. 1', color: 'blue' },
  { time: '11:00', endTime: '12:30', name: 'Cambridge B1', subject: 'Английский', room: 'Каб. 2', color: 'emerald' },
  { time: '18:00', endTime: '19:30', name: 'Munich B2', subject: 'Немецкий', room: 'Онлайн', color: 'slate' },
];

const scheduleColorMap: Record<string, { bg: string; border: string; time: string; timeDark: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', time: 'text-blue-600', timeDark: 'text-blue-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', time: 'text-emerald-600', timeDark: 'text-emerald-500' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-100', time: 'text-slate-600', timeDark: 'text-slate-500' },
};

export default function Dashboard() {
  const store = DataStore.getInstance();
  const activeStudents = store.getAllStudents().filter(s => s.status === 'active').length;
  const totalStudents = store.countStudents();
  const overduePayments = store.getAllPayments().filter(p => p.status === 'overdue').length;
  const today = new Date();
  const todayLessons = store.getAllScheduleItems().filter(si => {
    const d = new Date(si.start);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }).length;
  const newLeadsToday = store.getAllLeads().filter(l => {
    const created = new Date(l.createdAt);
    const d = new Date();
    return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth() && created.getDate() === d.getDate();
  }).length;

  const kpi = {
    newLeadsToday: newLeadsToday || allStudents.length > 0 ? Math.min(newLeadsToday || 5, totalStudents) : 5,
    activeStudents,
    monthlyRevenue: store.getAllPayments().filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 500000,
    overduePayments,
    upcomingLessons: todayLessons || 3,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="tracking-tight">Главная</h1>
          <p className="text-muted-foreground mt-1">Добро пожаловать, Елена. Вот что происходит сегодня.</p>
          <p className="mt-2 text-5xl font-extrabold text-red-600">ТЕСТ</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            Скачать отчёт
          </Button>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Сегодня
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Новые лиды сегодня</p>
                <p className="text-3xl font-bold mt-1">{kpi.newLeadsToday}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-blue-100">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12% от вчерашнего дня</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Активные клиенты</p>
                <p className="text-3xl font-bold mt-1">{kpi.activeStudents}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-emerald-100">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8 за неделю</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg shadow-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Выручка за месяц</p>
                <p className="text-3xl font-bold mt-1">€{(kpi.monthlyRevenue / 100).toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-amber-100">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+5% от прошлого месяца</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Просроченные оплаты</p>
                <p className="text-3xl font-bold mt-1">{kpi.overduePayments}</p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-red-100">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>Требует внимания</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-lg shadow-slate-500/20 col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Занятий сегодня</p>
                <p className="text-3xl font-bold mt-1">{kpi.upcomingLessons}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-slate-300">
              <Clock className="h-4 w-4 mr-1" />
              <span>3 завершено</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Выручка по месяцам</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Динамика выручки и количества клиентов</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} debounce={CHART_RESIZE_DEBOUNCE_MS}>
              <ComposedChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `€${v/1000}k`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#3B82F6" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="students" name="Клиенты" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Лиды по источникам</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Откуда приходят лиды</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200} debounce={CHART_RESIZE_DEBOUNCE_MS}>
              <PieChart>
                <Pie
                  data={leadsBySource}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {leadsBySource.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              {leadsBySource.slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground capitalize">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Удержание клиентов по уровням</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Процент клиентов, завершивших каждый уровень</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220} debounce={CHART_RESIZE_DEBOUNCE_MS}>
              <BarChart data={retentionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#64748B', fontSize: 12 }} width={40} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Удержание']}
                />
                <Bar dataKey="retention" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={24} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Предстоящие задачи</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7">
                Все задачи <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-lg bg-muted/80 p-3 border border-border/50">
                  <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-[10px]">{task.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Новые клиенты</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7">
                Все <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.language === 'German' ? 'Немецкий' : 'Английский'} - {student.currentLevel}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      student.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : student.status === 'frozen'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-muted-foreground border-border'
                    }`}
                  >
                    {student.status === 'active' ? 'Активен' : student.status === 'frozen' ? 'Заморожен' : 'Неактивен'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Расписание на сегодня</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7">
                Календарь <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todaySchedule.map((lesson, index) => {
                const colors = scheduleColorMap[lesson.color] || scheduleColorMap.slate;
                return (
                  <div key={index} className={`flex gap-3 rounded-lg ${colors.bg} border ${colors.border} p-3`}>
                    <div className="text-center flex-shrink-0 w-14">
                      <p className={`text-lg font-bold ${colors.time}`}>{lesson.time}</p>
                      <p className={`text-xs ${colors.timeDark}`}>-{lesson.endTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{lesson.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{lesson.subject}</span>
                        <span className="text-slate-300">-</span>
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

        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ближайшие мероприятия</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7">
                Все <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-3 rounded-lg border border-border/50 bg-slate-50/50 p-3">
                  <div className="text-center flex-shrink-0 w-12">
                    <p className="text-lg font-bold text-foreground">{new Date(event.date).getDate()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.registrations.length}/{event.capacity} записано</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      event.status === 'full'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    {event.status === 'full' ? 'Полный' : 'Открыт'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
