import { type DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  CalendarDays,
  Check,
  Clock3,
  Flame,
  GripVertical,
  ListChecks,
  MessageSquare,
  Plus,
  Search,
  Send,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import {
  demoAdministrators,
  demoAdminTasks,
  type DemoBoardTask,
  type DemoTaskPriority,
  type DemoTaskStatus,
  getNextShift,
  getShift,
} from '../data/demoAdministrators';
import { importedStudents } from '../data/importedStudents';
import { realGroups, type RealGroup } from '../data/realGroups';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'dk-admin-kanban-v1';
const GROUPS_STORAGE_KEY = 'dk-groups-workspace-v2';
const TODAY = startOfDay(new Date());
const TODAY_KEY = format(TODAY, 'yyyy-MM-dd');
const weekdayGenitive = ['воскресенья', 'понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы'];

const priorityConfig: Record<DemoTaskPriority, { label: string; dot: string; badge: string }> = {
  low: { label: 'Низкий', dot: 'bg-slate-400', badge: 'border-slate-200 bg-slate-50 text-slate-700' },
  medium: { label: 'Обычный', dot: 'bg-amber-400', badge: 'border-amber-200 bg-amber-50 text-amber-800' },
  high: { label: 'Важный', dot: 'bg-orange-500', badge: 'border-orange-200 bg-orange-50 text-orange-800' },
  urgent: { label: 'Срочный', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50 text-red-700' },
};

const statusLabels: Record<DemoTaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting: 'Ожидание',
  completed: 'Завершена',
};

type StoredGroupsWorkspace = {
  rosters?: Record<string, string[]>;
  paymentMarks?: Record<string, string[]>;
  groupDrafts?: Record<string, Partial<RealGroup>>;
  customGroups?: RealGroup[];
};

function nextOperatingDay(date: Date, steps: number) {
  const result = startOfDay(date);
  let remaining = steps;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0) remaining -= 1;
  }
  return result;
}

function nextMonday(date: Date) {
  const result = addDays(startOfDay(date), 1);
  while (result.getDay() !== 1) result.setDate(result.getDate() + 1);
  return result;
}

function groupInfo(group: RealGroup, workspace: StoredGroupsWorkspace) {
  const studentIds = workspace.rosters?.[group.id] ?? group.studentIds;
  const studentMap = new Map(importedStudents.map((student) => [student.id, student]));
  const paidCount = studentIds.filter((studentId) => {
    const marks = workspace.paymentMarks?.[`${group.id}:${studentId}`];
    return marks ? marks.includes('paid') : studentMap.get(studentId)?.paymentStatus === 'paid';
  }).length;
  const studyingCount = studentIds.filter((studentId) => {
    const marks = workspace.paymentMarks?.[`${group.id}:${studentId}`];
    return marks ? marks.includes('studying') : true;
  }).length;
  return `№${group.code} — ${group.name}; преподаватель: ${group.teacherName || 'не назначен'}; учится: ${studyingCount}/${studentIds.length}; оплачено: ${paidCount}/${studentIds.length}`;
}

function taskDescription(groups: RealGroup[], targetDate: Date, workspace: StoredGroupsWorkspace) {
  const heading = `Дата старта: ${format(targetDate, 'dd.MM.yyyy')} (${format(targetDate, 'EEEE', { locale: ru })}).`;
  if (!groups.length) return `${heading}\nНа эту дату группы в CRM не найдены. Проверить актуальность расписания.`;
  return [heading, 'Группы:', ...groups.map((group) => `• ${groupInfo(group, workspace)}`)].join('\n');
}

function regulationTask(
  date: Date,
  kind: string,
  title: string,
  description: string,
  subtasks: string[],
  priority: DemoTaskPriority = 'high',
): DemoBoardTask {
  const dateKey = format(date, 'yyyy-MM-dd');

  return {
    id: `auto-regulation-${dateKey}-${kind}`,
    title,
    description,
    assigneeId: null,
    dueDate: dateKey,
    priority,
    status: 'new',
    tags: ['Авто', 'Запуск группы'],
    subtasks: subtasks.map((subtask, index) => ({
      id: `auto-${dateKey}-${kind}-${index + 1}`,
      title: subtask,
      completed: false,
    })),
    comments: [],
    createdAt: new Date().toISOString(),
  };
}

function addDailyRegulationTasks(tasks: DemoBoardTask[]): DemoBoardTask[] {
  try {
    const workspace = JSON.parse(window.localStorage.getItem(GROUPS_STORAGE_KEY) || '{}') as StoredGroupsWorkspace;
    const groups = [...realGroups, ...(workspace.customGroups || [])].map((group) => ({
      ...group,
      ...workspace.groupDrafts?.[group.id],
      studentIds: workspace.rosters?.[group.id] ?? group.studentIds,
    })).filter((group, index, values) => values.findIndex((item) => item.id === group.id) === index);
    const migratedTasks = tasks.filter((task) => !task.id.startsWith('auto-group-start-'));

    if (TODAY.getDay() === 0) return migratedTasks;

    const groupsForDate = (date: Date) => groups.filter((group) =>
      format(new Date(group.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
    );
    const checkDate = nextOperatingDay(TODAY, 1);
    const launchDate = nextOperatingDay(TODAY, 2);
    const controlDate = nextOperatingDay(TODAY, 3);
    const checkGroups = groupsForDate(checkDate);
    const launchGroups = groupsForDate(launchDate);
    const controlGroups = groupsForDate(controlDate);
    const dailyTasks = [
      regulationTask(TODAY, 'check', `Проверка стартов ${weekdayGenitive[checkDate.getDay()]}`, taskDescription(checkGroups, checkDate, workspace), [
        'У всех студентов стоит оплата',
        'Список группы у преподавателя есть',
        'Чат в WhatsApp создан',
      ], 'urgent'),
      regulationTask(TODAY, 'launch', `Запуск групп ${weekdayGenitive[launchDate.getDay()]}`, taskDescription(launchGroups, launchDate, workspace), [
        'Проверить все оплаты; если оплаты нет — сделать тык на оплату',
        'Нажать кнопку «Стартовать группу»',
        'Проверить всю информацию о группе',
        'Сделать чат в Telegram',
        'Проверить расписание',
      ], 'urgent'),
      regulationTask(TODAY, 'control', `Контроль оплат и опрос людей ${weekdayGenitive[controlDate.getDay()]}`, taskDescription(controlGroups, controlDate, workspace), [
        `Напомнить или позвонить студентам групп, стартующих ${weekdayGenitive[controlDate.getDay()]}`,
        'Зафиксировать ответы и готовность студентов в CRM',
        'Проверить текущее количество оплат',
      ]),
      regulationTask(TODAY, 'reminders-zooms', 'Напоминалки + зумы', 'Ежедневная рабочая задача администратора.', [
        'Проверить и отправить необходимые напоминания',
        'Проверить ссылки и данные по Zoom-занятиям',
      ], 'medium'),
    ];

    if (TODAY.getDay() === 1 || TODAY.getDay() === 6) {
      const weekStart = nextMonday(TODAY);
      const weekEnd = addDays(weekStart, 5);
      const nextWeekGroups = groups.filter((group) => {
        const dateKey = format(new Date(group.startDate), 'yyyy-MM-dd');
        return dateKey >= format(weekStart, 'yyyy-MM-dd') && dateKey <= format(weekEnd, 'yyyy-MM-dd');
      });
      const weeklyDescription = [
        `Период: ${format(weekStart, 'dd.MM.yyyy')}–${format(weekEnd, 'dd.MM.yyyy')}.`,
        nextWeekGroups.length ? 'Группы:' : 'Группы на следующую неделю в CRM не найдены.',
        ...nextWeekGroups.map((group) => `• ${groupInfo(group, workspace)}`),
      ].join('\n');
      dailyTasks.push(TODAY.getDay() === 1
        ? regulationTask(TODAY, 'next-week-check', 'Протыкивание следующей недели', weeklyDescription, [
            'Провести массовый контроль оплат по всем группам следующей недели',
            'Проверить готовность студентов во всех группах следующей недели',
            'Связаться с группами, где не хватает оплат или подтверждений',
          ])
        : regulationTask(TODAY, 'next-week-plan', 'Планирование всей следующей недели', weeklyDescription, [
            'Проверить все группы, стартующие с понедельника по субботу',
            'Составить план контроля оплат, запусков и финальных проверок',
            'Проверить преподавателей и расписание',
          ]));
    }

    const existingIds = new Set(migratedTasks.map((task) => task.id));
    return [...dailyTasks.filter((task) => !existingIds.has(task.id)), ...migratedTasks];
  } catch {
    return tasks;
  }
}

function loadTasks(): DemoBoardTask[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return addDailyRegulationTasks(demoAdminTasks);
    const parsed: unknown = JSON.parse(saved);
    return addDailyRegulationTasks(Array.isArray(parsed) ? parsed as DemoBoardTask[] : demoAdminTasks);
  } catch {
    return addDailyRegulationTasks(demoAdminTasks);
  }
}

function dueDateView(dateKey: string) {
  const date = parseISO(dateKey);
  if (isBefore(date, TODAY)) return { label: 'Просрочено', className: 'text-red-600' };
  if (isSameDay(date, TODAY)) return { label: 'Сегодня', className: 'text-red-600' };
  if (isBefore(date, addDays(TODAY, 3))) return { label: format(date, 'EEEE', { locale: ru }), className: 'text-amber-700' };
  return { label: format(date, 'd MMM', { locale: ru }), className: 'text-muted-foreground' };
}

function shiftLabel(adminId: string) {
  const shift = getShift(adminId, TODAY_KEY);
  if (shift) return `Сегодня · ${shift.segments.join(', ').replace(/-/g, '–')}`;
  const nextShift = getNextShift(adminId, TODAY_KEY);
  return nextShift ? `Следующая смена · ${format(parseISO(nextShift.date), 'd MMM', { locale: ru })}` : 'Смен пока нет';
}

export default function Tasks() {
  const [tasks, setTasks] = useState<DemoBoardTask[]>(loadTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createFor, setCreateFor] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const draggedRef = useRef(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '2026-08-21', priority: 'medium' as DemoTaskPriority, assigneeId: 'unassigned' });
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (task.status === 'completed') return false;
    if (!normalizedQuery) return true;
    return `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery, tasks]);

  const tasksFor = (assigneeId: string | null) => visibleTasks
    .filter((task) => task.assigneeId === assigneeId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const updateTask = (taskId: string, patch: Partial<DemoBoardTask>) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, ...patch } : task));
  };

  const handleDragStart = (event: DragEvent, taskId: string) => {
    draggedRef.current = true;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (event: DragEvent, assigneeId: string | null) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    if (taskId) updateTask(taskId, { assigneeId, status: assigneeId ? 'in_progress' : 'new' });
    setDragOverColumn(null);
    window.setTimeout(() => { draggedRef.current = false; }, 0);
  };

  const openCreate = (assigneeId: string | null) => {
    setNewTask({ title: '', description: '', dueDate: '2026-08-21', priority: 'medium', assigneeId: assigneeId ?? 'unassigned' });
    setCreateFor(assigneeId);
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;
    const task: DemoBoardTask = {
      id: `adm-task-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      assigneeId: newTask.assigneeId === 'unassigned' ? null : newTask.assigneeId,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: newTask.assigneeId === 'unassigned' ? 'new' : 'in_progress',
      tags: [],
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [task, ...current]);
    setCreateFor(undefined);
  };

  const addSubtask = () => {
    if (!selectedTask || !newSubtask.trim()) return;
    updateTask(selectedTask.id, { subtasks: [...selectedTask.subtasks, { id: `sub-${Date.now()}`, title: newSubtask.trim(), completed: false }] });
    setNewSubtask('');
  };

  const addComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    updateTask(selectedTask.id, { comments: [...selectedTask.comments, { id: `comment-${Date.now()}`, author: 'Демо-директор', text: newComment.trim(), createdAt: new Date().toISOString() }] });
    setNewComment('');
  };

  const columns = [{ id: 'unassigned', name: 'Неразобранное', assigneeId: null as string | null }, ...demoAdministrators.map((admin) => ({ id: admin.id, name: admin.shortName, assigneeId: admin.id }))];
  const completedCount = tasks.filter((task) => task.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Задачи администраторов</h1>
          <p className="mt-1 text-sm text-muted-foreground">Все сотрудники остаются на доске — задачу можно поставить и на будущую смену.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 xl:w-[300px] xl:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по задачам…" className="h-9 pl-9" />
          </div>
          <Badge variant="outline" className="h-9 px-3 font-normal">Завершено: {completedCount}</Badge>
          <Button className="h-9 gap-2" onClick={() => openCreate(null)}><Plus className="h-4 w-4" />Новая задача</Button>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-3">
        <div className="flex min-w-max items-start gap-3">
          {columns.map((column) => {
            const admin = demoAdministrators.find((item) => item.id === column.assigneeId);
            const columnTasks = tasksFor(column.assigneeId);
            const isDragTarget = dragOverColumn === column.id;
            return (
              <section
                key={column.id}
                className={cn('w-[286px] flex-none rounded-xl border p-2 transition-all', admin?.columnTone ?? 'bg-amber-50/80', isDragTarget && 'border-primary ring-2 ring-primary/20')}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverColumn(column.id); }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverColumn(null); }}
                onDrop={(event) => handleDrop(event, column.assigneeId)}
              >
                <div className="mb-2 px-1 py-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {admin ? <Avatar className="h-8 w-8"><AvatarFallback className={cn('text-[10px] font-semibold text-white', admin.accent)}>{admin.initials}</AvatarFallback></Avatar> : <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed bg-white"><UserRound className="h-4 w-4 text-muted-foreground" /></div>}
                      <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{column.name}</h2><p className="truncate text-[10px] text-muted-foreground">{admin ? shiftLabel(admin.id) : 'Без исполнителя'}</p></div>
                    </div>
                    <Badge variant="outline" className="bg-white/70 text-xs">{columnTasks.length}</Badge>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-15rem)] min-h-[500px]">
                  <div className="space-y-2 pr-2">
                    {columnTasks.map((task) => {
                      const due = dueDateView(task.dueDate);
                      const completedSubtasks = task.subtasks.filter((item) => item.completed).length;
                      return (
                        <Card
                          key={task.id}
                          draggable
                          onDragStart={(event) => handleDragStart(event, task.id)}
                          onDragEnd={() => { setDragOverColumn(null); window.setTimeout(() => { draggedRef.current = false; }, 0); }}
                          onClick={() => { if (!draggedRef.current) setSelectedTaskId(task.id); }}
                          className="group cursor-grab border-white/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md active:cursor-grabbing"
                        >
                          <div className="p-3">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" /><span className={cn('font-medium', due.className)}>{due.label}</span>{task.priority === 'urgent' && <Flame className="h-3.5 w-3.5 text-red-500" />}</div>
                              <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 transition group-hover:opacity-100" />
                            </div>
                            <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>
                            {task.description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>}
                            {task.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{task.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="outline" className="h-5 bg-muted/50 px-1.5 text-[10px] font-normal">{tag}</Badge>)}</div>}
                            <div className="mt-3 flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><span className={cn('h-2 w-2 rounded-full', priorityConfig[task.priority].dot)} />{priorityConfig[task.priority].label}</span>
                              <span className="flex items-center gap-2">{task.subtasks.length > 0 && <span className="flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" />{completedSubtasks}/{task.subtasks.length}</span>}{task.comments.length > 0 && <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{task.comments.length}</span>}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    {columnTasks.length === 0 && <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-current/15 bg-white/30 px-5 text-center text-xs text-muted-foreground">Перетащите задачу в эту колонку</div>}
                    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => openCreate(column.assigneeId)}><Plus className="h-4 w-4" />Добавить задачу</Button>
                  </div>
                </ScrollArea>
              </section>
            );
          })}
        </div>
      </div>

      <Dialog open={createFor !== undefined} onOpenChange={(open) => { if (!open) setCreateFor(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Новая задача</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label htmlFor="new-task-title">Название</Label><Input id="new-task-title" autoFocus value={newTask.title} onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))} placeholder="Что нужно сделать?" /></div>
            <div className="grid gap-2"><Label htmlFor="new-task-description">Описание</Label><Textarea id="new-task-description" value={newTask.description} onChange={(event) => setNewTask((current) => ({ ...current, description: event.target.value }))} placeholder="Контекст и ожидаемый результат…" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Исполнитель</Label><Select value={newTask.assigneeId} onValueChange={(value) => setNewTask((current) => ({ ...current, assigneeId: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Неразобранное</SelectItem>{demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid gap-2"><Label>Срок</Label><Input type="date" value={newTask.dueDate} onChange={(event) => setNewTask((current) => ({ ...current, dueDate: event.target.value }))} /></div>
            </div>
            <div className="grid gap-2"><Label>Приоритет</Label><Select value={newTask.priority} onValueChange={(value) => setNewTask((current) => ({ ...current, priority: value as DemoTaskPriority }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([value, config]) => <SelectItem key={value} value={value}>{config.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCreateFor(undefined)}>Отмена</Button><Button onClick={createTask} disabled={!newTask.title.trim()}>Создать</Button></div>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <Dialog open onOpenChange={(open) => { if (!open) setSelectedTaskId(null); }}>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
            <div className="border-b p-6 pb-4">
              <DialogHeader>
                <div className="pr-8"><DialogTitle className="text-xl leading-snug">{selectedTask.title}</DialogTitle><div className="mt-2 flex flex-wrap items-center gap-2"><Badge variant="outline" className={priorityConfig[selectedTask.priority].badge}>{selectedTask.priority === 'urgent' && <Flame className="mr-1 h-3 w-3" />}{priorityConfig[selectedTask.priority].label}</Badge><Badge variant="outline">{statusLabels[selectedTask.status]}</Badge></div></div>
              </DialogHeader>
            </div>

            <div className="space-y-5 p-6 pt-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-1.5"><Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />Исполнитель</Label><Select value={selectedTask.assigneeId ?? 'unassigned'} onValueChange={(value) => updateTask(selectedTask.id, { assigneeId: value === 'unassigned' ? null : value, status: value === 'unassigned' ? 'new' : selectedTask.status === 'new' ? 'in_progress' : selectedTask.status })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Неразобранное</SelectItem>{demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid gap-1.5"><Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Срок</Label><Input className="h-9" type="date" value={selectedTask.dueDate} onChange={(event) => updateTask(selectedTask.id, { dueDate: event.target.value })} /></div>
                <div className="grid gap-1.5"><Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Flame className="h-3.5 w-3.5" />Приоритет</Label><Select value={selectedTask.priority} onValueChange={(value) => updateTask(selectedTask.id, { priority: value as DemoTaskPriority })}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([value, config]) => <SelectItem key={value} value={value}>{config.label}</SelectItem>)}</SelectContent></Select></div>
              </div>

              <div className="grid gap-2"><Label>Название</Label><Input value={selectedTask.title} onChange={(event) => updateTask(selectedTask.id, { title: event.target.value })} /></div>
              <div className="grid gap-2"><Label>Описание</Label><Textarea className="min-h-28" value={selectedTask.description} onChange={(event) => updateTask(selectedTask.id, { description: event.target.value })} placeholder="Добавьте детали задачи…" /></div>
              {selectedTask.tags.length > 0 && <div><p className="mb-2 flex items-center gap-1.5 text-sm font-medium"><Tag className="h-4 w-4" />Ярлыки</p><div className="flex flex-wrap gap-1.5">{selectedTask.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></div>}

              <Separator />
              <div>
                <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><ListChecks className="h-4 w-4" />Подзадачи</h3><span className="text-xs text-muted-foreground">{selectedTask.subtasks.filter((item) => item.completed).length}/{selectedTask.subtasks.length}</span></div>
                <div className="space-y-2">
                  {selectedTask.subtasks.map((subtask) => <label key={subtask.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-sm"><Checkbox checked={subtask.completed} onCheckedChange={(checked) => updateTask(selectedTask.id, { subtasks: selectedTask.subtasks.map((item) => item.id === subtask.id ? { ...item, completed: checked === true } : item) })} /><span className={cn(subtask.completed && 'text-muted-foreground line-through')}>{subtask.title}</span></label>)}
                  <div className="flex gap-2"><Input value={newSubtask} onChange={(event) => setNewSubtask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addSubtask(); }} placeholder="Добавить подзадачу…" /><Button variant="outline" onClick={addSubtask} disabled={!newSubtask.trim()}><Plus className="h-4 w-4" /></Button></div>
                </div>
              </div>

              <Separator />
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" />Активность и комментарии</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 text-sm"><div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-muted"><Clock3 className="h-3.5 w-3.5 text-muted-foreground" /></div><div><p>Задача создана</p><p className="text-xs text-muted-foreground">{format(parseISO(selectedTask.createdAt), 'd MMMM, HH:mm', { locale: ru })}</p></div></div>
                  {selectedTask.comments.map((comment) => <div key={comment.id} className="flex gap-3 text-sm"><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-[9px] text-primary">ДД</AvatarFallback></Avatar><div className="min-w-0 flex-1 rounded-lg bg-muted/60 p-3"><div className="mb-1 flex items-center justify-between gap-2"><strong className="text-xs">{comment.author}</strong><span className="text-[10px] text-muted-foreground">{format(parseISO(comment.createdAt), 'd MMM, HH:mm', { locale: ru })}</span></div><p className="whitespace-pre-wrap text-sm">{comment.text}</p></div></div>)}
                  <div className="flex gap-2"><Textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Напишите комментарий…" className="min-h-20" /><Button size="icon" className="self-end" onClick={addComment} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center">
                <Select value={selectedTask.status} onValueChange={(value) => updateTask(selectedTask.id, { status: value as DemoTaskStatus })}><SelectTrigger className="sm:w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
                <Button className="gap-2 sm:ml-auto" onClick={() => updateTask(selectedTask.id, { status: 'completed' })}><Check className="h-4 w-4" />Завершить</Button>
                <Button variant="destructive" size="icon" aria-label="Удалить задачу" onClick={() => { setTasks((current) => current.filter((task) => task.id !== selectedTask.id)); setSelectedTaskId(null); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
