import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { Download, Users, DollarSign, Calendar, BookOpen } from 'lucide-react';
import { getAllStudents, getAllGroups, getAllPayments, getAllLeads } from '../data/selectors';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('12m');

  const allStudents = useMemo(() => getAllStudents(), []);
  const allGroups = useMemo(() => getAllGroups(), []);
  const allPayments = useMemo(() => getAllPayments(), []);
  const allLeads = useMemo(() => getAllLeads(), []);

  const revenueData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    allPayments.forEach(p => {
      if (p.status === 'paid' && p.paidDate) {
        const key = MONTHS[new Date(p.paidDate).getMonth()];
        byMonth[key] = (byMonth[key] || 0) + (p.amount || 0);
      }
    });
    return MONTHS.map(name => ({ name, revenue: byMonth[name] || 0 }));
  }, [allPayments]);

  const leadsData = useMemo(() => {
    const bySource: Record<string, number> = {};
    allLeads.forEach(l => {
      bySource[l.source || 'other'] = (bySource[l.source || 'other'] || 0) + 1;
    });
    return Object.entries(bySource).map(([name, value]) => ({ name, value }));
  }, [allLeads]);

  const retentionData = useMemo(() => {
    return LEVELS.map(name => {
      const levelStudents = allStudents.filter(s => s.currentLevel === name);
      const completed = levelStudents.filter(s => s.status === 'inactive' || s.status === 'graduated').length;
      const rate = levelStudents.length > 0 ? Math.round((completed / levelStudents.length) * 100) : 0;
      return { name, retention: rate };
    });
  }, [allStudents]);

  const studentsByLanguage = useMemo(() => [
    { name: 'German', value: allStudents.filter(s => s.language === 'German').length },
    { name: 'English', value: allStudents.filter(s => s.language === 'English').length },
  ], [allStudents]);

  const studentsByLevel = useMemo(() =>
    LEVELS.map(name => ({ name, value: allStudents.filter(s => s.currentLevel === name).length })),
  [allStudents]);

  const groupsByLanguage = useMemo(() => [
    { name: 'German', value: allGroups.filter(g => g.language === 'German').length },
    { name: 'English', value: allGroups.filter(g => g.language === 'English').length },
  ], [allGroups]);

  const paymentStatus = useMemo(() => [
    { name: 'Paid', value: allPayments.filter(p => p.status === 'paid').length, fill: '#10B981' },
    { name: 'Pending', value: allPayments.filter(p => p.status === 'pending').length, fill: '#F59E0B' },
    { name: 'Overdue', value: allPayments.filter(p => p.status === 'overdue').length, fill: '#EF4444' },
  ], [allPayments]);

  const totalRevenue = useMemo(() => allPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0), [allPayments]);
  const attendanceData = useMemo(() => {
    const byMonth: Record<string, { total: number; attended: number }> = {};
    allPayments.forEach(p => {
      if (p.status === 'paid' && p.paidDate) {
        const key = MONTHS[new Date(p.paidDate).getMonth()];
        if (!byMonth[key]) byMonth[key] = { total: 0, attended: 0 };
        byMonth[key].total += 1;
        byMonth[key].attended += 1;
      }
    });
    return MONTHS.slice(0, 6).map(month => ({
      month,
      rate: byMonth[month] ? Math.round((byMonth[month].attended / byMonth[month].total) * 100) : 90,
    }));
  }, [allPayments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your school</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{allStudents.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Groups</p>
                <p className="text-2xl font-bold">{allGroups.filter(g => g.status === 'active').length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">{attendanceData.length > 0 ? Math.round(attendanceData.reduce((s, d) => s + d.rate, 0) / attendanceData.length) : 0}%</p>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="finance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="finance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `€${v/1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Distribution of payment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentStatus.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 text-sm mt-4">
                  {paymentStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Students by Language</CardTitle>
                <CardDescription>Distribution across languages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentsByLanguage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students by Level</CardTitle>
                <CardDescription>Distribution across proficiency levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentsByLevel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Retention by Level</CardTitle>
                <CardDescription>Percentage of students completing each level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Retention']} />
                    <Line type="monotone" dataKey="retention" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Groups by Language</CardTitle>
                <CardDescription>Active groups distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={groupsByLanguage}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {groupsByLanguage.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[groupsByLanguage.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {groupsByLanguage.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-muted-foreground">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads by Source</CardTitle>
                <CardDescription>Where your leads come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Rate Trend</CardTitle>
                <CardDescription>Monthly average attendance percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis domain={[80, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'Attendance']} />
                    <Area type="monotone" dataKey="rate" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
