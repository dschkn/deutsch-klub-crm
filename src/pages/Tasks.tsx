import { type DragEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, format, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  CalendarDays,
  Check,
  Clock3,
  Flame,
  FolderCog,
  GripVertical,
  LayoutDashboard,
  List,
  ListChecks,
  MessageSquare,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  Settings,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Textarea } from '../components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import {
  demoAdministrators,
  demoAdminTasks,
  type DemoBoardTask,
  type DemoTaskPriority,
  getNextShift,
  getShift,
} from '../data/demoAdministrators';
import { importedStudents } from '../data/importedStudents';
import { realGroups, type RealGroup } from '../data/realGroups';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'dk-admin-kanban-v1';
const TRASH_STORAGE_KEY = 'dk-admin-kanban-trash-v1';
const GROUPS_STORAGE_KEY = 'dk-groups-workspace-v2';
const TODAY = startOfDay(new Date());
const TODAY_KEY = format(TODAY, 'yyyy-MM-dd');
const weekdayGenitive = ['воскресенья', 'понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы'];
const columnGlass: Record<string, string> = {
  unassigned: 'rgba(229, 222, 191, 0.72)',
  'admin-01': 'rgba(187, 199, 219, 0.68)',
  'admin-02': 'rgba(184, 214, 197, 0.68)',
  'admin-03': 'rgba(204, 190, 226, 0.68)',
  'admin-04': 'rgba(176, 207, 224, 0.68)',
  'admin-05': 'rgba(223, 203, 176, 0.68)',
  'admin-06': 'rgba(218, 186, 193, 0.68)',
  'admin-07': 'rgba(184, 194, 211, 0.68)',
};

const priorityConfig: Record<DemoTaskPriority, { label: string; dot: string; badge: string }> = {
  low: { label: 'Низкий', dot: 'bg-slate-400', badge: 'border-slate-200 bg-slate-50 text-slate-700' },
  medium: { label: 'Обычный', dot: 'bg-amber-400', badge: 'border-amber-200 bg-amber-50 text-amber-800' },
  high: { label: 'Важный', dot: 'bg-orange-500', badge: 'border-orange-200 bg-orange-50 text-orange-800' },
  urgent: { label: 'Срочный', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50 text-red-700' },
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
    if (!saved) return addDailyRegulationTasks([]);
    const parsed: unknown = JSON.parse(saved);
    const demoIds = new Set(demoAdminTasks.map((task) => task.id));
    const realTasks = Array.isArray(parsed)
      ? (parsed as DemoBoardTask[]).filter((task) => !demoIds.has(task.id))
      : [];
    return addDailyRegulationTasks(realTasks);
  } catch {
    return addDailyRegulationTasks([]);
  }
}

function loadTrash(): DemoBoardTask[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(TRASH_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed as DemoBoardTask[] : [];
  } catch {
    return [];
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
  const [trash, setTrash] = useState<DemoBoardTask[]>(loadTrash);
  const [trashOpen, setTrashOpen] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createFor, setCreateFor] = useState<string | null | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const draggedRef = useRef(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: TODAY_KEY, priority: 'medium' as DemoTaskPriority, assigneeId: 'unassigned' });
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  }, [trash]);

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

  const completeTask = (taskId: string) => {
    updateTask(taskId, { status: 'completed', completedAt: new Date().toISOString() });
    setSelectedTaskId(null);
  };

  const deleteTask = (task: DemoBoardTask) => {
    setTrash((current) => [{ ...task }, ...current.filter((item) => item.id !== task.id)]);
    setTasks((current) => current.filter((item) => item.id !== task.id));
    setSelectedTaskId(null);
    toast.success('Задача перемещена в корзину');
  };

  const restoreTask = (task: DemoBoardTask) => {
    setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
    setTrash((current) => current.filter((item) => item.id !== task.id));
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
    setNewTask({ title: '', description: '', dueDate: TODAY_KEY, priority: 'medium', assigneeId: assigneeId ?? 'unassigned' });
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
  const completedTodayCount = tasks.filter((task) => task.status === 'completed' && format(parseISO(task.completedAt || `${task.dueDate}T12:00:00`), 'yyyy-MM-dd') === TODAY_KEY).length;
  const monthStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  const daysInMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
  const calendarLeadingCells = monthStart.getDay() === 0 ? 0 : monthStart.getDay() - 1;
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => new Date(TODAY.getFullYear(), TODAY.getMonth(), index + 1)).filter((date) => date.getDay() !== 0);

  const handleBoardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-no-board-pan]')) return;
    const board = boardScrollRef.current;
    if (!board) return;
    panRef.current = { active: true, startX: event.clientX, scrollLeft: board.scrollLeft, moved: false };
    board.setPointerCapture(event.pointerId);
    board.classList.add('cursor-grabbing');
  };

  const handleBoardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const board = boardScrollRef.current;
    if (!board || !panRef.current.active) return;
    const distance = event.clientX - panRef.current.startX;
    if (Math.abs(distance) > 4) panRef.current.moved = true;
    board.scrollLeft = panRef.current.scrollLeft - distance;
  };

  const stopBoardPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const board = boardScrollRef.current;
    panRef.current.active = false;
    if (board?.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
    board?.classList.remove('cursor-grabbing');
  };

  return (
    <div
      className="-m-4 min-h-[calc(100vh-4rem)] overflow-hidden bg-cover bg-center bg-fixed p-4 md:-m-6 md:p-6"
      style={{ backgroundImage: "linear-gradient(rgba(18, 31, 31, 0.2), rgba(11, 24, 23, 0.34)), url('/tasks-nordic-forest.jpg')" }}
    >
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/25 bg-slate-950/45 p-4 text-white shadow-xl shadow-black/15 backdrop-blur-xl xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Задачи администраторов</h1>
          <p className="mt-1 text-sm text-white/65">Рабочая доска команды</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 xl:w-[300px] xl:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по задачам…" className="h-9 border-white/20 bg-white/90 pl-9 text-foreground" />
          </div>
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setCompletedOpen(true)} className="h-9 cursor-help rounded-md border border-white/20 bg-white/90 px-3 text-xs font-normal text-foreground transition hover:bg-white">Завершено сегодня: {completedTodayCount}</button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[310px] bg-zinc-800 px-3 py-2 leading-relaxed text-white" side="bottom">
                Количество задач, которым сегодня поставили статус «Завершено». Здесь учитываются все сотрудники доски.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button className="h-9 gap-2" onClick={() => openCreate(null)}><Plus className="h-4 w-4" />Новая задача</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-9 w-9 bg-white/80" aria-label="Настройки доски"><Settings className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl border-white/40 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
              <DropdownMenuLabel>Вид отображения задач</DropdownMenuLabel>
              <div className="grid grid-cols-3 gap-2 p-2 pt-0">
                <Button variant="ghost" className={cn('h-auto flex-col gap-2 rounded-lg border py-3 text-muted-foreground', viewMode === 'board' && 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50')} onClick={() => setViewMode('board')}><LayoutDashboard className="h-7 w-7" /><span className="text-xs">Доска</span></Button>
                <Button variant="ghost" className={cn('h-auto flex-col gap-2 rounded-lg border py-3 text-muted-foreground', viewMode === 'list' && 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50')} onClick={() => setViewMode('list')}><List className="h-7 w-7" /><span className="text-xs">Список</span></Button>
                <Button variant="ghost" className={cn('h-auto flex-col gap-2 rounded-lg border py-3 text-muted-foreground', viewMode === 'calendar' && 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50')} onClick={() => setViewMode('calendar')}><CalendarDays className="h-7 w-7" /><span className="text-xs">Календарь</span></Button>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2.5 text-sm" onSelect={() => toast.info('Настройки проекта реализуем на следующем этапе')}><FolderCog className="mr-3 h-5 w-5" />Настройки проекта</DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 text-sm" onSelect={() => toast.info('Печать доски реализуем позже')}><Printer className="mr-3 h-5 w-5" />Распечатать доску</DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 text-sm" onSelect={() => setTrashOpen(true)}><Trash2 className="mr-3 h-5 w-5" />Корзина задач <span className="ml-auto text-xs text-muted-foreground">{trash.length}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === 'board' ? <div
        ref={boardScrollRef}
        className="-mx-1 min-h-[calc(100vh-10rem)] cursor-grab overflow-x-auto px-1 pb-3 select-none"
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={stopBoardPan}
        onPointerCancel={stopBoardPan}
      >
        <div className="flex min-w-max items-start gap-3">
          {columns.map((column) => {
            const admin = demoAdministrators.find((item) => item.id === column.assigneeId);
            const columnTasks = tasksFor(column.assigneeId);
            const isDragTarget = dragOverColumn === column.id;
            return (
              <section
                key={column.id}
                data-no-board-pan
                style={{ backgroundColor: columnGlass[column.id] }}
                className={cn('w-[286px] flex-none rounded-xl border border-white/25 p-2 shadow-xl shadow-black/15 backdrop-blur-xl transition-all', isDragTarget && 'border-primary ring-2 ring-primary/30')}
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

                <ScrollArea className={cn(columnTasks.length ? 'h-[calc(100vh-15rem)] min-h-[500px]' : 'h-auto')}>
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
                        className="group cursor-grab border-white/45 bg-white/85 shadow-md shadow-slate-950/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/95 hover:shadow-lg active:cursor-grabbing"
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
      </div> : viewMode === 'list' ? (
        <div className="min-h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-white/70 bg-white/85 shadow-sm backdrop-blur-md">
          {columns.map((column) => {
            const columnTasks = tasksFor(column.assigneeId);
            if (!columnTasks.length) return null;
            return (
              <section key={column.id} className="border-b last:border-b-0">
                <div className="flex items-center justify-between bg-muted/40 px-5 py-3">
                  <h2 className="font-semibold">{column.name}</h2>
                  <Badge variant="outline" className="bg-white">{columnTasks.length}</Badge>
                </div>
                <div>
                  {columnTasks.map((task) => {
                    const due = dueDateView(task.dueDate);
                    return (
                      <div key={task.id} onClick={() => setSelectedTaskId(task.id)} className="grid cursor-pointer grid-cols-[auto_minmax(220px,1fr)_210px_110px] items-center gap-3 border-t px-5 py-3 text-sm transition first:border-t-0 hover:bg-primary/5">
                        <Checkbox checked={task.status === 'completed'} onClick={(event) => event.stopPropagation()} onCheckedChange={(checked) => checked && completeTask(task.id)} />
                        <div className="min-w-0"><p className="truncate font-medium">{task.title}</p><p className="truncate text-xs text-muted-foreground">{task.description}</p></div>
                        <Select value={task.assigneeId ?? 'unassigned'} onValueChange={(value) => updateTask(task.id, { assigneeId: value === 'unassigned' ? null : value, status: value === 'unassigned' ? 'new' : 'in_progress' })}>
                          <SelectTrigger className="h-8 bg-white" onClick={(event) => event.stopPropagation()}><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="unassigned">Неразобранное</SelectItem>{demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <span className={cn('text-right text-xs', due.className)}>{due.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {visibleTasks.length === 0 && <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">Задач пока нет</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/70 bg-white/65 shadow-sm backdrop-blur-sm">
          <div className="border-b bg-white/80 px-5 py-3 font-semibold">{format(TODAY, 'LLLL yyyy', { locale: ru })}</div>
          <div className="grid grid-cols-6 border-b bg-white/75 text-xs font-medium text-muted-foreground">
            {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].map((day) => <div key={day} className="border-r px-3 py-2 last:border-r-0">{day}</div>)}
          </div>
          <div className="grid min-h-[calc(100vh-14rem)] grid-cols-6 auto-rows-[minmax(150px,1fr)]">
            {Array.from({ length: calendarLeadingCells }, (_, index) => <div key={`empty-${index}`} className="border-b border-r bg-white/25" />)}
            {calendarDays.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayTasks = visibleTasks.filter((task) => task.dueDate === dateKey);
              return (
                <div key={dateKey} className={cn('border-b border-r p-2 last:border-r-0', dateKey === TODAY_KEY ? 'bg-primary/10' : 'bg-white/30')}>
                  <div className="mb-2 text-xs text-muted-foreground">{format(date, 'd MMMM', { locale: ru })}</div>
                  <div className="space-y-1.5">
                    {dayTasks.map((task) => <button key={task.id} onClick={() => setSelectedTaskId(task.id)} className="block w-full truncate rounded-md border bg-white px-2 py-1.5 text-left text-xs shadow-sm transition hover:border-primary/30 hover:shadow">{task.title}</button>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      <Sheet open={Boolean(selectedTask)} onOpenChange={(open) => { if (!open) setSelectedTaskId(null); }}>
        <SheetContent side="right" overlayClassName="bg-black/10" className="w-[min(560px,94vw)] overflow-y-auto border-white/20 bg-slate-50/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-none">
          {selectedTask && (
            <>
            <div className="border-b border-slate-200/70 bg-white/80 p-6 pb-4">
              <SheetHeader>
                <div className="pr-8">
                  <p className="mb-3 text-xs text-muted-foreground">#{selectedTask.id.replace(/\D/g, '').slice(-7) || selectedTask.id.slice(-7)}</p>
                  <SheetTitle className="text-xl leading-snug">{selectedTask.title}</SheetTitle>
                  <SheetDescription className="sr-only">Подробности и редактирование задачи</SheetDescription>
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><LayoutDashboard className="h-4 w-4" /><span>Задачи</span><span>›</span><span>Рабочая доска</span><span>›</span><span>{selectedTask.assigneeId ? demoAdministrators.find((admin) => admin.id === selectedTask.assigneeId)?.shortName : 'Неразобранное'}</span></div>
                </div>
              </SheetHeader>
            </div>

            <div className="space-y-5 p-6 pt-4">
              <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                <Button size="icon" className="h-10 w-10 rounded-full"><Plus className="h-5 w-5" /></Button>
                <Badge variant="outline" className={priorityConfig[selectedTask.priority].badge}>{selectedTask.priority === 'urgent' && <Flame className="mr-1 h-3 w-3" />}{priorityConfig[selectedTask.priority].label}</Badge>
                <Button variant="outline" className="ml-auto gap-2 bg-white" onClick={() => completeTask(selectedTask.id)}><Check className="h-4 w-4" />Завершить</Button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label className="flex items-center gap-1.5 text-sm text-muted-foreground"><UserRound className="h-4 w-4" />Исполнитель</Label><Select value={selectedTask.assigneeId ?? 'unassigned'} onValueChange={(value) => updateTask(selectedTask.id, { assigneeId: value === 'unassigned' ? null : value, status: value === 'unassigned' ? 'new' : selectedTask.status === 'new' ? 'in_progress' : selectedTask.status })}><SelectTrigger className="h-9 border-0 bg-transparent shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">Неразобранное</SelectItem>{demoAdministrators.map((admin) => <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label className="flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />Дата</Label><Input className="h-9 border-0 bg-transparent shadow-none" type="date" value={selectedTask.dueDate} onChange={(event) => updateTask(selectedTask.id, { dueDate: event.target.value })} /></div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Flame className="h-4 w-4" />Приоритет</Label><Select value={selectedTask.priority} onValueChange={(value) => updateTask(selectedTask.id, { priority: value as DemoTaskPriority })}><SelectTrigger className="h-9 border-0 bg-transparent shadow-none"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([value, config]) => <SelectItem key={value} value={value}>{config.label}</SelectItem>)}</SelectContent></Select></div>
              </div>

              <Textarea className="min-h-28 bg-white/80" value={selectedTask.description} onChange={(event) => updateTask(selectedTask.id, { description: event.target.value })} placeholder="Нажмите, чтобы добавить описание…" />
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

              <div className="flex justify-end border-t pt-4">
                <Button variant="ghost" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => deleteTask(selectedTask)}><Trash2 className="h-4 w-4" />В корзину</Button>
              </div>
            </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Корзина задач</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {trash.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Trash2 className="h-4 w-4 flex-none text-muted-foreground" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.assigneeId ? demoAdministrators.find((admin) => admin.id === task.assigneeId)?.name : 'Без ответственного'}</p></div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => restoreTask(task)}><RotateCcw className="h-3.5 w-3.5" />Восстановить</Button>
                <Button variant="ghost" size="icon" aria-label="Удалить окончательно" onClick={() => setTrash((current) => current.filter((item) => item.id !== task.id))}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ))}
            {trash.length === 0 && <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Корзина пуста</div>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={completedOpen} onOpenChange={setCompletedOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>Выполненные задачи</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {tasks.filter((task) => task.status === 'completed').map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50"><Check className="h-4 w-4 text-emerald-600" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{task.completedAt ? format(parseISO(task.completedAt), 'd MMMM, HH:mm', { locale: ru }) : 'Выполнено'}</p></div>
                <Button variant="ghost" size="sm" onClick={() => updateTask(task.id, { status: task.assigneeId ? 'in_progress' : 'new', completedAt: undefined })}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Вернуть</Button>
              </div>
            ))}
            {!tasks.some((task) => task.status === 'completed') && <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">Выполненных задач пока нет</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
