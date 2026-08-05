import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../ui/table';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { realGroups } from '../../data/realGroups';
import { demoTeacherUserMap } from '../../data/demoTeachers';
import { DataStore } from '../../data/store';
import { NormalizedTeacherScheduleItem, NormalizedComment } from '../../types/normalized';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Send, Clock, X } from 'lucide-react';

const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const courseTypeLabels: Record<string, string> = {
  individual: 'Индивидуальная',
  club: 'Клуб',
  group: 'Групповая',
  intensive: 'Интенсив',
  grammar: 'Грамматика',
  mini: 'Мини-группа',
  phonetics: 'Фонетика',
  open_lesson: 'Открытый урок',
  test: 'Тест',
  language_course: 'Языковой курс',
  medical: 'Медицинский',
};

const languageLabels: Record<string, string> = {
  German: 'Немецкий',
  English: 'Английский',
};

function formatRoomKey(key: string | undefined): string {
  if (!key) return '';
  if (key.startsWith('zoom')) return `Zoom ${key.replace('zoom', '')}`;
  if (key === 'office') return 'Офис';
  if (key.startsWith('room')) return key.replace('room', 'Каб. ');
  return key;
}

interface GroupInfoDialogProps {
  groupId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GroupInfoDialog({ groupId, open, onOpenChange }: GroupInfoDialogProps) {
  const [activeTab, setActiveTab] = useState('data');
  const [groupItems, setGroupItems] = useState<NormalizedTeacherScheduleItem[]>([]);
  const [comments, setComments] = useState<NormalizedComment[]>([]);
  const [newComment, setNewComment] = useState('');

  const group = groupId ? realGroups.find(g => g.id === groupId) ?? null : null;

  const store = DataStore.getInstance();

  useEffect(() => {
    if (groupId) {
      const items = store.getGroupScheduleItems(groupId);
      setGroupItems(items);
      const entityComments = store.getEntityComments('group', groupId);
      setComments(entityComments);
    }
  }, [groupId, open]);

  if (!group) return null;

  const teacher = group.teacherId ? demoTeacherUserMap[group.teacherId] : null;

  const handleAddComment = () => {
    if (!newComment.trim() || !groupId) return;
    store.addComment({
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      entityType: 'group',
      entityId: groupId,
      authorId: 'admin',
      text: newComment.trim(),
      parentId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewComment('');
    setComments(store.getEntityComments('group', groupId));
  };

  const handleDeleteComment = (commentId: string) => {
    store.softDeleteComment(commentId);
    if (groupId) setComments(store.getEntityComments('group', groupId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500 text-white font-bold flex items-center justify-center text-sm">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <DialogTitle className="text-lg">{group.name}</DialogTitle>
              <DialogDescription className="sr-only">Информация о группе</DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{languageLabels[group.language]}</Badge>
                <Badge variant="outline" className="text-xs">{group.level}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="data">Данные</TabsTrigger>
            <TabsTrigger value="schedule">Дни занятий</TabsTrigger>
            <TabsTrigger value="lessons">Занятия</TabsTrigger>
            <TabsTrigger value="students">Студенты</TabsTrigger>
            <TabsTrigger value="comments">Комментарии</TabsTrigger>
          </TabsList>

          {/* === TAB: Данные группы === */}
          <TabsContent value="data" className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Номер группы</span>
                  <span className="font-medium">#{group.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Название</span>
                  <span className="font-medium">{group.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Язык</span>
                  <span className="font-medium">{languageLabels[group.language]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Уровень</span>
                  <span className="font-medium">{group.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Тип курса</span>
                  <span className="font-medium">{courseTypeLabels[group.courseType] || group.courseType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Стоимость</span>
                  <span className="font-medium">{group.price.toLocaleString()} ₽</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Ак. часов</span>
                  <span className="font-medium">{group.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Преподаватель</span>
                  <span className="font-medium">{teacher ? teacher.name : group.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Учебник</span>
                  <span className="font-medium truncate">{group.textbook || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Дата начала</span>
                  <span className="font-medium">{format(group.startDate, 'dd.MM.yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 min-w-[100px]">Дата окончания</span>
                  <span className="font-medium">{group.endDate ? format(group.endDate, 'dd.MM.yyyy') : '—'}</span>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* === TAB: Дни занятий === */}
          <TabsContent value="schedule" className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2 py-3">
                {group.schedule.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Расписание не задано</p>
                ) : (
                  group.schedule.map((s, i) => {
                    const [sh, sm] = s.startTime.split(':').map(Number);
                    const [eh, em] = s.endTime.split(':').map(Number);
                    const duration = (eh * 60 + em - (sh * 60 + sm)) / 60;
                    const formatVal = s.classroom?.startsWith('zoom') || s.zoomRoom ? 'online' :
                      s.classroom || s.zoomRoom ? 'offline' : undefined;
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 text-sm">
                        <div className="w-20 font-medium">{dayNames[s.dayOfWeek]}</div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{s.startTime}–{s.endTime}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{duration.toFixed(1)} ак.ч</Badge>
                        <div className="flex-1" />
                        <span className="text-xs text-slate-500">
                          {formatRoomKey(s.classroom || s.zoomRoom) || '—'}
                        </span>
                        {formatVal && (
                          <Badge variant="outline" className={`text-xs ${formatVal === 'online' ? 'text-purple-600 border-purple-200' : 'text-amber-600 border-amber-200'}`}>
                            {formatVal === 'online' ? 'ОН' : 'ОФ'}
                          </Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* === TAB: Занятия === */}
          <TabsContent value="lessons" className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-1 py-3">
                {groupItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">Нет занятий</p>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="text-xs">Дата</TableHead>
                          <TableHead className="text-xs">Время</TableHead>
                          <TableHead className="text-xs">Статус</TableHead>
                          <TableHead className="text-xs">Кабинет</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupItems
                          .sort((a, b) => a.start.getTime() - b.start.getTime())
                          .map(item => {
                            const isPast = item.start < new Date();
                            const statusText = item.status === 'cancelled' ? 'Отменено' :
                              isPast ? 'Проведено' : 'Запланировано';
                            const statusColor = item.status === 'cancelled' ? 'text-red-600' :
                              isPast ? 'text-green-600' : 'text-blue-600';
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="text-xs">{format(item.start, 'dd.MM.yyyy')}</TableCell>
                                <TableCell className="text-xs">
                                  {format(item.start, 'HH:mm')}–{format(item.end, 'HH:mm')}
                                </TableCell>
                                <TableCell className="text-xs">
                                  <span className={statusColor}>{statusText}</span>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">
                                  {formatRoomKey(item.roomId || item.zoomRoomId) || '—'}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* === TAB: Студенты === */}
          <TabsContent value="students" className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="py-3">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="text-xs">ФИО</TableHead>
                        <TableHead className="text-xs">Телефон</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Статус</TableHead>
                        <TableHead className="text-xs">Оплаты</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const students = store.getGroupStudents(group.id);
                        if (students.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-slate-400 py-8 text-sm">
                                Нет зачисленных студентов
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return students.map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="text-xs font-medium">{s.fullName}</TableCell>
                            <TableCell className="text-xs text-slate-500">{s.phones[0] || '—'}</TableCell>
                            <TableCell className="text-xs text-slate-500">{s.emails[0] || '—'}</TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Записан
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">—</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* === TAB: Комментарии === */}
          <TabsContent value="comments" className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-2">
              <div className="py-3 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Нет комментариев</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 group">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                          {c.authorId === 'admin' ? 'А' : c.authorId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {c.authorId === 'admin' ? 'Администратор' : c.authorId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {format(c.createdAt, 'd MMM yyyy, HH:mm', { locale: ru })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-0.5 whitespace-pre-wrap">{c.text}</p>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 mt-2 flex gap-2">
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
              <Button size="sm" className="h-9 shrink-0" onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" />
                Отправить
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
