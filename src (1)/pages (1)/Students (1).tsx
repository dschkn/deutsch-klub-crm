import { useState, useEffect, useMemo } from 'react';
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
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import {
  Search,
  Phone,
  Mail,
  CreditCard,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { getAllStudents, getAllGroups, getAllPayments, getAllLessons } from '../data/selectors';
import { Student } from '../types';
import { format } from 'date-fns';

const PAGE_SIZE = 50;

const statusConfig: Record<Student['status'], { label: string; color: string; dotColor: string }> = {
  active: { label: 'Активен', color: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  inactive: { label: 'Неактивен', color: 'bg-slate-50 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
  graduated: { label: 'Выпускник', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  frozen: { label: 'Заморожен', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
};

const paymentStatusConfig: Record<Student['paymentStatus'], { label: string; color: string; dotColor: string }> = {
  paid: { label: 'Оплачено', color: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  pending: { label: 'Ожидает', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  overdue: { label: 'Просрочено', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
};

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const allStudents = useMemo(() => getAllStudents(), []);
  const allGroups = useMemo(() => getAllGroups(), []);
  const allPayments = useMemo(() => getAllPayments(), []);
  const allLessons = useMemo(() => getAllLessons(), []);

  // Auto-open student profile from localStorage (navigated from schedule)
  useEffect(() => {
    const studentId = localStorage.getItem('open_student_id');
    if (studentId) {
      localStorage.removeItem('open_student_id');
      const student = allStudents.find(s => s.id === studentId);
      if (student) setSelectedStudent(student);
    }
  }, []);

  const filteredStudents = useMemo(() => allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesLanguage = filterLanguage === 'all' || student.language === filterLanguage;
    const matchesLevel = filterLevel === 'all' || student.currentLevel === filterLevel;
    const matchesSource = filterSource === 'all' || (student as any).howDidYouKnow === filterSource;
    return matchesSearch && matchesStatus && matchesLanguage && matchesLevel && matchesSource;
  }), [searchQuery, filterStatus, filterLanguage, filterLevel, filterSource]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(
    () => filteredStudents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredStudents, safePage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterLanguage, filterLevel, filterSource]);

  const studentPayments = selectedStudent
    ? allPayments.filter(p => p.student.id === selectedStudent.id)
    : [];

  const studentLessons = selectedStudent
    ? allLessons.filter(l => l.group.students.some(s => s.id === selectedStudent.id))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground">База данных клиентов и их прогресс</p>
        </div>
        <Button className="gap-2">
          <GraduationCap className="h-4 w-4" />
          Добавить клиента
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск клиентов..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Все статусы</option>
          <option value="active">Активен</option>
          <option value="inactive">Неактивен</option>
          <option value="frozen">Заморожен</option>
          <option value="graduated">Выпускник</option>
        </select>
        <select
          className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm"
          value={filterLanguage}
          onChange={(e) => setFilterLanguage(e.target.value)}
        >
          <option value="all">Все языки</option>
          <option value="German">Немецкий</option>
          <option value="English">Английский</option>
        </select>
        <select
          className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="all">Все уровни</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
        <select
          className="h-9 rounded-md border border-border bg-white px-3 py-1 text-sm"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="all">Откуда узнали</option>
          <option value="instagram">Instagram</option>
          <option value="vk">VK</option>
          <option value="google">Google</option>
          <option value="referral">Рекомендация</option>
          <option value="website">Сайт</option>
          <option value="yandex">Яндекс</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Всего клиентов</p>
                <p className="text-2xl font-bold">{allStudents.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Активных</p>
                <p className="text-2xl font-bold text-green-600">
                  {allStudents.filter(s => s.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ожидают оплату</p>
                <p className="text-2xl font-bold text-amber-600">
                  {allStudents.filter(s => s.paymentStatus === 'pending').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Просрочено</p>
                <p className="text-2xl font-bold text-red-600">
                  {allStudents.filter(s => s.paymentStatus === 'overdue').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Язык</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Оплата</TableHead>
                <TableHead>Записан</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.language}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.language}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.currentLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[student.status].color}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[student.status].dotColor} mr-1.5`} />
                      {statusConfig[student.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={paymentStatusConfig[student.paymentStatus].color}>
                      <span className={`h-1.5 w-1.5 rounded-full ${paymentStatusConfig[student.paymentStatus].dotColor} mr-1.5`} />
                      {paymentStatusConfig[student.paymentStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(student.joinDate, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Открыть профиль</DropdownMenuItem>
                        <DropdownMenuItem>Редактировать</DropdownMenuItem>
                        <DropdownMenuItem>Сменить группу</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Деактивировать</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Показано {Math.min(filteredStudents.length, 1 + (safePage - 1) * PAGE_SIZE)}–{Math.min(filteredStudents.length, safePage * PAGE_SIZE)} из {filteredStudents.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (safePage <= 4) {
                  pageNum = i + 1;
                } else if (safePage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = safePage - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={safePage === pageNum ? 'outline' : 'ghost'}
                    size="sm"
                    className="min-w-[36px]"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Профиль клиента</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                    <Badge variant="outline" className={statusConfig[selectedStudent.status].color}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[selectedStudent.status].dotColor} mr-1.5`} />
                      {statusConfig[selectedStudent.status].label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedStudent.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedStudent.email}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">{selectedStudent.language === 'German' ? 'Немецкий' : 'Английский'}</Badge>
                    <Badge variant="outline">Уровень {selectedStudent.currentLevel}</Badge>
                    <Badge className={paymentStatusConfig[selectedStudent.paymentStatus].color}>
                      {paymentStatusConfig[selectedStudent.paymentStatus].label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Баланс</p>
                  <p className={`text-lg font-semibold ${selectedStudent.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    €{selectedStudent.balance}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="groups">Группы</TabsTrigger>
                  <TabsTrigger value="payments">Оплаты</TabsTrigger>
                  <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
                  <TabsTrigger value="comments">Комментарии</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Прогресс</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Грамматика</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Говорение</span>
                              <span>72%</span>
                            </div>
                            <Progress value={72} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Аудирование</span>
                              <span>68%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Письмо</span>
                              <span>78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Статистика</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Уроков посещено</p>
                            <p className="text-lg font-semibold">45</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Посещаемость</p>
                            <p className="text-lg font-semibold">92%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Всего оплачено</p>
                            <p className="text-lg font-semibold">€{selectedStudent.balance >= 0 ? '4,500' : '3,800'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Клиент с</p>
                            <p className="text-lg font-semibold">{format(selectedStudent.joinDate, 'MMM yyyy')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Заметки</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedStudent.notes || 'Нет заметок'}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="groups">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Группа</TableHead>
                            <TableHead>Язык</TableHead>
                            <TableHead>Уровень</TableHead>
                            <TableHead>Преподаватель</TableHead>
                            <TableHead>Расписание</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allGroups.filter(g => g.students.some(s => s.id === selectedStudent.id)).map((group) => (
                            <TableRow key={group.id}>
                              <TableCell className="font-medium">{group.name}</TableCell>
                              <TableCell>{group.language}</TableCell>
                              <TableCell>{group.level}</TableCell>
                              <TableCell>{group.teacher.name}</TableCell>
                              <TableCell className="text-sm">
                                {group.schedule.map(s => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][s.dayOfWeek - 1]).join(', ')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Описание</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Дата оплаты</TableHead>
                            <TableHead>Оплачено</TableHead>
                            <TableHead>Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.description}</TableCell>
                              <TableCell className="font-medium">€{payment.amount}</TableCell>
                              <TableCell>{format(payment.dueDate, 'MMM d, yyyy')}</TableCell>
                              <TableCell>
                                {payment.paidDate ? format(payment.paidDate, 'MMM d, yyyy') : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-amber-100 text-amber-800'
                                }>
                                  {payment.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attendance">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Группа</TableHead>
                            <TableHead>Тема</TableHead>
                            <TableHead>Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentLessons.slice(0, 10).map((lesson) => {
                            const attendance = lesson.attendance.find(a => a.student.id === selectedStudent.id);
                            return (
                              <TableRow key={lesson.id}>
                                <TableCell>{format(lesson.date, 'MMM d, yyyy')}</TableCell>
                                <TableCell>{lesson.group.name}</TableCell>
                                <TableCell>{lesson.topic}</TableCell>
                                <TableCell>
                                  <Badge className={attendance?.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {attendance?.present ? 'Присутствовал' : 'Отсутствовал'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" />
                        <AvatarFallback>SK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">Sophia Klein</p>
                            <p className="text-xs text-muted-foreground">2 дня назад</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Отличный прогресс по грамматике. Рекомендуется перевод на уровень B2.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100" />
                        <AvatarFallback>AF</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">Anna Fischer</p>
                            <p className="text-xs text-muted-foreground">5 дней назад</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Домашнее задание выполнено вовремя. Хорошо участвует в обсуждениях на уроке.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add a comment..." className="flex-1" />
                      <Button>Post</Button>
                    </div>
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
