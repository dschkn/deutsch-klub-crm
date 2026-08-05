import { useState, useMemo } from 'react';
import { Card, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
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
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  Video,
  MoreHorizontal,
  Download,
  Edit,
  Archive,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { getAllStudents } from '../data/selectors';
import { Club, ClubMember } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

// Генерация тестовых клубов
function generateClubs(students: any[]): Club[] {
  const clubs: Club[] = [
    {
      id: 'club-1',
      name: 'Немецкий онлайн',
      description: 'Разговорный клуб немецкого языка онлайн',
      language: 'German',
      format: 'online',
      schedule: [{ dayOfWeek: 2, startTime: '18:00', endTime: '19:30', zoomRoom: 'zoom-de-1' }],
      members: [],
      status: 'active',
    },
    {
      id: 'club-2',
      name: 'Немецкий офлайн',
      description: 'Разговорный клуб немецкого языка в офисе',
      language: 'German',
      format: 'offline',
      schedule: [{ dayOfWeek: 4, startTime: '18:00', endTime: '19:30', classroom: 'Room 1' }],
      members: [],
      status: 'active',
    },
    {
      id: 'club-3',
      name: 'Английский B2/C1',
      description: 'Продвинутый разговорный клуб английского',
      language: 'English',
      level: 'B2',
      format: 'online',
      schedule: [{ dayOfWeek: 3, startTime: '19:00', endTime: '20:30', zoomRoom: 'zoom-en-1' }],
      members: [],
      status: 'active',
    },
  ];

  // Добавляем участников
  clubs.forEach((club) => {
    const numMembers = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < numMembers; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const paymentTypes: ClubMember['paymentType'][] = ['subscription', 'single', 'trial'];
      club.members.push({
        id: `member-${club.id}-${i}`,
        student,
        paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
        lessonsRemaining: Math.floor(Math.random() * 8),
        joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }
  });

  return clubs;
}

const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const paymentTypeConfig: Record<ClubMember['paymentType'], { label: string; color: string }> = {
  subscription: { label: 'Абонемент', color: 'bg-green-50 text-green-700 border-green-200' },
  single: { label: 'Разовое', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  trial: { label: 'Пробное', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function Clubs() {
  const allStudents = useMemo(() => getAllStudents(), []);
  const [clubs] = useState<Club[]>(() => generateClubs(allStudents));
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || club.language === filterLanguage;
    const matchesFormat = filterFormat === 'all' || club.format === filterFormat;
    return matchesSearch && matchesLanguage && matchesFormat;
  });

  const exportMembers = (club: Club) => {
    const data = club.members.map(m => ({
      name: m.student.name,
      phone: m.student.phone,
      paymentType: paymentTypeConfig[m.paymentType].label,
      lessonsRemaining: m.lessonsRemaining,
      joinedAt: format(m.joinedAt, 'dd.MM.yyyy'),
    }));
    console.log('Export:', data);
    alert(`Экспортировано ${data.length} участников`);
  };

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Клубы</h1>
          <p className="text-muted-foreground mt-0.5">Управление разговорными клубами</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Создать клуб
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Создать клуб</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Название</Label>
                <Input placeholder="Название клуба" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Язык</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="German">Немецкий</SelectItem>
                      <SelectItem value="English">Английский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Формат</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Онлайн</SelectItem>
                      <SelectItem value="offline">Офлайн</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Описание</Label>
                <Input placeholder="Описание клуба" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Отмена</Button>
              <Button>Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Три панели */}
      <div className="flex gap-4 h-[calc(100%-4rem)]">
        {/* Левая панель - список клубов */}
        <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 border-b border-border/50 space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск клубов..."
                className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все языки</SelectItem>
                  <SelectItem value="German">Немецкий</SelectItem>
                  <SelectItem value="English">Английский</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="online">Онлайн</SelectItem>
                  <SelectItem value="offline">Офлайн</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => setSelectedClub(club)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all duration-150',
                    selectedClub?.id === club.id
                      ? 'bg-blue-50/80 border border-blue-200/60'
                      : 'hover:bg-muted border border-transparent'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">{club.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        club.format === 'online'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}
                    >
                      {club.format === 'online' ? 'Онлайн' : 'Офлайн'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{club.language === 'German' ? 'Немецкий' : 'Английский'}</span>
                    {club.level && (
                      <>
                        <span className="text-muted-foreground/70">•</span>
                        <span>{club.level}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{club.members.length} участников</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Центральная панель - содержимое клуба */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
          {selectedClub ? (
            <>
              <div className="p-6 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedClub.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedClub.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {selectedClub.language === 'German' ? 'Немецкий' : 'Английский'}
                      </Badge>
                      {selectedClub.level && (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                          {selectedClub.level}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          selectedClub.format === 'online'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}
                      >
                        {selectedClub.format === 'online' ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            Онлайн
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            Офлайн
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => exportMembers(selectedClub)}>
                      <Download className="h-4 w-4" />
                      Экспорт
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Archive className="h-4 w-4" />
                          Архивировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedClub.schedule.map(s => dayNames[s.dayOfWeek]).join(', ')}
                    </span>
                  </div>
                  <span className="text-muted-foreground/70">|</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedClub.schedule[0]?.startTime} - {selectedClub.schedule[0]?.endTime}
                  </span>
                  {selectedClub.schedule[0]?.classroom && (
                    <>
                      <span className="text-muted-foreground/70">|</span>
                      <span className="text-sm text-muted-foreground">{selectedClub.schedule[0].classroom}</span>
                    </>
                  )}
                  {selectedClub.schedule[0]?.zoomRoom && (
                    <>
                      <span className="text-muted-foreground/70">|</span>
                      <span className="text-sm text-blue-500">{selectedClub.schedule[0].zoomRoom}</span>
                    </>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-foreground">Участники ({selectedClub.members.length})</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Добавить участника
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-medium text-muted-foreground">ФИО</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Тип оплаты</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Осталось занятий</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Присоединился</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClub.members.map((member) => (
                          <TableRow key={member.id} className="group cursor-pointer">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs">
                                    {member.student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground text-sm">{member.student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={paymentTypeConfig[member.paymentType].color}>
                                {paymentTypeConfig[member.paymentType].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                'font-medium',
                                member.lessonsRemaining <= 2 ? 'text-red-600' : 'text-foreground'
                              )}>
                                {member.lessonsRemaining}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(member.joinedAt, 'dd.MM.yyyy')}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Выберите клуб</h3>
                <p className="text-sm text-muted-foreground mt-1">Выберите клуб из списка для просмотра участников</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
