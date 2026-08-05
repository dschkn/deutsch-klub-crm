import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  Search,
  BookOpen,
  Star,
  Users,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  Award,
} from 'lucide-react';
import { getAllTeachers, getAllGroups } from '../data/selectors';
import { Teacher } from '../types';
import { format } from 'date-fns';

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const allTeachers = useMemo(() => getAllTeachers(), []);
  const allGroups = useMemo(() => getAllGroups(), []);

  const filteredTeachers = allTeachers.filter(teacher =>
    teacher.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Преподаватели</h1>
          <p className="text-muted-foreground">Управление преподавательским составом и расписанием</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Добавить преподавателя
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск преподавателей..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего преподавателей</p>
                <p className="text-2xl font-bold">{allTeachers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активных групп</p>
                <p className="text-2xl font-bold">{allGroups.filter(g => g.status === 'active').length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего учеников</p>
                <p className="text-2xl font-bold">{allTeachers.reduce((sum, t) => sum + t.statistics.totalStudents, 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Средний рейтинг</p>
                <p className="text-2xl font-bold">
                  {(allTeachers.reduce((sum, t) => sum + t.statistics.averageRating, 0) / allTeachers.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.user.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setSelectedTeacher(teacher)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={teacher.user.avatar} />
                  <AvatarFallback>{teacher.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{teacher.user.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-amber-600 mt-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{teacher.statistics.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.languages.map(lang => (
                      <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{teacher.statistics.activeGroups}</p>
                  <p className="text-xs text-muted-foreground">Групп</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{teacher.statistics.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Учеников</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{teacher.statistics.totalHours}ч</p>
                  <p className="text-xs text-muted-foreground">Часов</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Нагрузка</span>
                  <span className="font-medium">{Math.min(teacher.statistics.totalHours / 150 * 100, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(teacher.statistics.totalHours / 150 * 100, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teacher Detail Dialog */}
      {selectedTeacher && (
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Профиль преподавателя</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedTeacher.user.avatar} />
                  <AvatarFallback className="text-2xl">
                    {selectedTeacher.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedTeacher.user.name}</h3>
                  <div className="flex items-center gap-1 text-amber-600 mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{selectedTeacher.statistics.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">({selectedTeacher.statistics.completedLessons} уроков)</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedTeacher.user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedTeacher.user.phone}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tabs */}
              <Tabs defaultValue="schedule" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                  <TabsTrigger value="groups">Группы</TabsTrigger>
                  <TabsTrigger value="vacations">Отпуска</TabsTrigger>
                  <TabsTrigger value="statistics">Статистика</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Время</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead>Группа</TableHead>
                            <TableHead>Место</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTeacher.schedule.slice(0, 10).map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{format(item.date, 'EEE, MMM d')}</TableCell>
                              <TableCell>{item.startTime} - {item.endTime}</TableCell>
                              <TableCell>
                                <Badge variant={item.type === 'lesson' ? 'default' : 'secondary'}>
                                  {item.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.group?.name || '-'}</TableCell>
                              <TableCell>
                                {item.zoomRoom ? (
                                  <span className="text-blue-500">Online</span>
                                ) : item.classroom ? (
                                  <span>{item.classroom}</span>
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="groups">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Group</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Schedule</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTeacher.groups.map((group) => (
                            <TableRow key={group.id}>
                              <TableCell className="font-medium">{group.name}</TableCell>
                              <TableCell>{group.language}</TableCell>
                              <TableCell>{group.level}</TableCell>
                              <TableCell>{group.students.length}/{group.maxStudents}</TableCell>
                              <TableCell className="text-sm">
                                {group.schedule.map(s => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek - 1]).join(', ')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vacations">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTeacher.vacations.map((vacation) => (
                            <TableRow key={vacation.id}>
                              <TableCell className="capitalize">{vacation.type.replace('_', ' ')}</TableCell>
                              <TableCell>{format(vacation.startDate, 'MMM d, yyyy')}</TableCell>
                              <TableCell>{format(vacation.endDate, 'MMM d, yyyy')}</TableCell>
                              <TableCell>
                                <Badge className={
                                  vacation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  vacation.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {vacation.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="statistics">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Teaching Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { label: 'Total Students', value: selectedTeacher.statistics.totalStudents },
                            { label: 'Active Groups', value: selectedTeacher.statistics.activeGroups },
                            { label: 'Completed Lessons', value: selectedTeacher.statistics.completedLessons },
                            { label: 'Total Hours', value: `${selectedTeacher.statistics.totalHours}h` },
                          ].map((stat) => (
                            <div key={stat.label} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{stat.label}</span>
                              <span className="font-semibold">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeacher.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="py-1 px-3">
                              <Globe className="h-3 w-3 mr-1" />
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Specializations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeacher.specializations.map((spec) => (
                            <Badge key={spec} variant="outline" className="py-1 px-3">
                              <Award className="h-3 w-3 mr-1" />
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
