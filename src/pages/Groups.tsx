import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
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
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Search,
  Users,
  ArrowRight,
  Edit,
  Archive,
  FileText,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { realGroups, RealGroup } from '../data/realGroups';
import { demoTeacherUserMap } from '../data/demoTeachers';
import { DataStore } from '../data/store';
import type { NormalizedComment } from '../types/normalized';
import { User } from '../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../lib/utils';

const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function getLevels(): string[] {
  const set = new Set(realGroups.map(g => g.level));
  return Array.from(set).sort();
}

const allLevels = getLevels();

interface DisplayGroup extends RealGroup {
  teacherUser: User | null;
}

const displayGroups: DisplayGroup[] = realGroups.map(g => ({
  ...g,
  teacherUser: g.teacherId ? demoTeacherUserMap[g.teacherId] || null : null,
}));

const statusLabels: Record<string, string> = {
  active: 'Текущие',
  planned: 'Грядущие',
  completed: 'Архивные',
};

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DisplayGroup | null>(null);
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [contractsDialogOpen, setContractsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'planned' | 'completed'>('active');
  const [groupComments, setGroupComments] = useState<NormalizedComment[]>([]);
  const [newComment, setNewComment] = useState('');

  const store = DataStore.getInstance();

  useEffect(() => {
    if (selectedGroup) {
      const comments = store.getEntityComments('group', selectedGroup.id);
      setGroupComments(comments);
    } else {
      setGroupComments([]);
    }
  }, [selectedGroup]);

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedGroup) return;
    store.addComment({
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entityType: 'group',
      entityId: selectedGroup.id,
      authorId: 'admin',
      text: newComment.trim(),
      parentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewComment('');
    setGroupComments(store.getEntityComments('group', selectedGroup.id));
  };

  const handleDeleteComment = (commentId: string) => {
    store.softDeleteComment(commentId);
    if (selectedGroup) setGroupComments(store.getEntityComments('group', selectedGroup.id));
  };

  const filteredGroups = displayGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || group.language === filterLanguage;
    const matchesLevel = filterLevel === 'all' || group.level === filterLevel;
    const matchesStatus = group.status === activeTab;
    return matchesSearch && matchesLanguage && matchesLevel && matchesStatus;
  });

  return (
    <div className="h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Группы</h1>
          <p className="text-muted-foreground mt-0.5">Управление учебными группами</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить группу
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as typeof activeTab)} className="h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="active">Текущие</TabsTrigger>
            <TabsTrigger value="planned">Грядущие</TabsTrigger>
            <TabsTrigger value="completed">Архивные</TabsTrigger>
          </TabsList>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск групп..."
              className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue placeholder="Язык" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="German">Немецкий</SelectItem>
              <SelectItem value="English">Английский</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-24 h-9 text-xs">
              <SelectValue placeholder="Уровень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {allLevels.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="flex-1 m-0">
          <div className="flex gap-4 h-full">
            <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all duration-150',
                        selectedGroup?.id === group.id
                          ? 'bg-teal-50/80 border border-teal-200/60'
                          : 'hover:bg-muted border border-transparent'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-foreground text-sm">{group.name}</span>
                        <span className="text-xs text-muted-foreground">#{group.code.replace('26-', '')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{group.language === 'German' ? 'DE' : 'EN'}</span>
                        <span className="text-muted-foreground/70">-</span>
                        <span>{group.level}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px]">{group.teacherName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground flex-1 truncate">{group.teacherName}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>0</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="flex-1 flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border-border/60">
              {selectedGroup ? (
                <>
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-teal-500 text-white font-bold flex items-center justify-center text-sm">
                          #{selectedGroup.code.replace('26-', '')}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">{selectedGroup.name}</h2>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{selectedGroup.language === 'German' ? 'Немецкий' : 'Английский'}</Badge>
                            <Badge variant="outline" className="text-xs">{selectedGroup.level}</Badge>
                            <Badge variant="outline" className={cn(
                              'text-xs',
                              selectedGroup.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                              selectedGroup.status === 'planned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            )}>{statusLabels[selectedGroup.status]}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50">
                          <Edit className="h-4 w-4" />
                          Редактировать
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Archive className="h-4 w-4" />
                          Архивировать
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Дата начала</p>
                        <p className="font-medium">{format(selectedGroup.startDate, 'dd.MM.yyyy')}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Дата окончания</p>
                        <p className="font-medium">{format(selectedGroup.endDate, 'dd.MM.yyyy')}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Объем курса</p>
                        <p className="font-medium">{selectedGroup.hours} ак.ч.</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Стоимость</p>
                        <p className="font-medium">{selectedGroup.price.toLocaleString()} ₽</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Учебник</p>
                        <p className="font-medium truncate">{selectedGroup.textbook || '—'}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Расписание</p>
                        <p className="font-medium">{selectedGroup.schedule.map(s => `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(', ') || '—'}</p>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Студенты (0)</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setTransferDialogOpen(true)}>
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Перевести
                            </Button>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Добавить
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">ФИО</TableHead>
                                <TableHead className="text-xs">Статус</TableHead>
                                <TableHead className="text-xs w-24">Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8 text-sm">
                                  Нет зачисленных студентов
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Comments section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">Комментарии ({groupComments.length})</h3>
                        </div>

                        <div className="space-y-3 mb-4">
                          {groupComments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Нет комментариев</p>
                          ) : (
                            groupComments.map(c => (
                              <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted group">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                                    {c.authorId === 'admin' ? 'А' : c.authorId.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-semibold text-foreground">
                                      {c.authorId === 'admin' ? 'Администратор' : c.authorId}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {format(c.createdAt, 'd MMM yyyy, HH:mm', { locale: ru })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.text}</p>
                                </div>
                                <button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                  onClick={() => handleDeleteComment(c.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2 border-t pt-3">
                          <Textarea
                            className="text-xs min-h-[40px] flex-1"
                            placeholder="Напишите комментарий..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                          />
                          <Button size="sm" className="h-9 shrink-0 self-end" onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Отправить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3" />
                    <p className="text-muted-foreground">Выберите группу</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Перевод студентов</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Выберите целевую группу</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Группа" />
              </SelectTrigger>
              <SelectContent>
                {displayGroups.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Отмена</Button>
            <Button onClick={() => setTransferDialogOpen(false)}>Перевести</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={contractsDialogOpen} onOpenChange={setContractsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Договоры студента</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Договор #{1000 + i}</p>
                  <p className="text-xs text-muted-foreground">от {format(new Date(2024, i, 1), 'dd.MM.yyyy')}</p>
                </div>
                <Badge variant="outline" className="text-xs">Подписан</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
