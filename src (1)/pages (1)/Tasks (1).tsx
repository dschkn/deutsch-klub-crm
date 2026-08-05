import { useState, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getAllTasks } from '../data/selectors';
import { Task } from '../types';
import { format, isBefore, isToday, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../lib/utils';

const priorityConfig: Record<Task['priority'], { label: string; color: string; dotColor: string }> = {
  low: { label: 'Низкий', color: 'text-slate-600', dotColor: 'bg-slate-400' },
  medium: { label: 'Средний', color: 'text-amber-600', dotColor: 'bg-amber-500' },
  high: { label: 'Высокий', color: 'text-orange-600', dotColor: 'bg-orange-500' },
  urgent: { label: 'Срочный', color: 'text-red-600', dotColor: 'bg-red-500' },
};

const managers = [
  { id: 'unassigned', name: 'Неразобранное' },
  { id: 'nastya', name: 'Настя' },
  { id: 'sergey', name: 'Сергей' },
  { id: 'ekaterina', name: 'Екатерина' },
  { id: 'gosha', name: 'Гоша' },
  { id: 'polya', name: 'Поля' },
  { id: 'dmitry', name: 'Дмитрий' },
  { id: 'aleksandra', name: 'Александра' },
];

function getDueDateStatus(dueDate: Date): { text: string; color: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (isBefore(due, today)) {
    return { text: 'Просрочено', color: 'text-red-600' };
  } else if (isToday(due)) {
    return { text: 'Сегодня', color: 'text-amber-600' };
  } else if (isBefore(due, new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))) {
    return { text: format(due, 'EEE', { locale: ru }), color: 'text-blue-600' };
  } else {
    return { text: format(due, 'd MMM', { locale: ru }), color: 'text-muted-foreground' };
  }
}

// Распределяем задачи по менеджерам
function assignTasksToManagers(tasks: Task[]): Record<string, Task[]> {
  const result: Record<string, Task[]> = {};
  managers.forEach(m => {
    result[m.id] = [];
  });

  tasks.forEach((task, idx) => {
    if (task.status === 'completed') return;
    const managerIds = managers.map(m => m.id).slice(1);
    const managerId = managerIds[idx % managerIds.length];
    result[managerId]?.push(task);
  });

  // Неразобранное - все новые задачи
  result['unassigned'] = tasks.filter(t => t.status === 'new');

  return result;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getAllTasks());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const tasksByManager = assignTasksToManagers(tasks);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, _managerId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'in_progress' } : t
      ));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Задачи</h1>
          <p className="text-muted-foreground mt-0.5">Управление задачами команды</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Новая задача
        </Button>
      </div>

      {/* Kanban by Managers */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="min-w-[280px] w-[280px] flex-shrink-0"
            onDrop={(e) => handleDrop(e, manager.id)}
            onDragOver={handleDragOver}
          >
            <div className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 mb-3',
              manager.id === 'unassigned' ? 'bg-amber-50' : 'bg-muted'
            )}>
              <div className="flex items-center gap-2">
                {manager.id !== 'unassigned' && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {manager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="font-medium text-sm text-foreground">{manager.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {tasksByManager[manager.id]?.length || 0}
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2 pr-2">
                {tasksByManager[manager.id]?.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer transition-all hover:shadow-md bg-white"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-2">
                        <div className={cn('mt-1 h-2 w-2 rounded-full flex-shrink-0', priorityConfig[task.priority].dotColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className={getDueDateStatus(task.dueDate).color}>
                                {getDueDateStatus(task.dueDate).text}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-2">
                            {task.status === 'completed' && (
                              <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Готово
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {tasksByManager[manager.id]?.length === 0 && (
                  <div className="flex h-24 items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                    Перетащите задачу
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название</Label>
              <Input placeholder="Название задачи" />
            </div>
            <div className="grid gap-2">
              <Label>Описание</Label>
              <Textarea placeholder="Описание задачи..." className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Исполнитель</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.slice(1).map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Приоритет</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                    <SelectItem value="urgent">Срочный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Срок</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Отмена</Button>
            <Button onClick={() => setIsAdding(false)}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTask.title}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    priorityConfig[selectedTask.priority].color.includes('red') ? 'bg-red-50 text-red-700' :
                    priorityConfig[selectedTask.priority].color.includes('orange') ? 'bg-orange-50 text-orange-700' :
                    priorityConfig[selectedTask.priority].color.includes('amber') ? 'bg-amber-50 text-amber-700' :
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {priorityConfig[selectedTask.priority].label}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Исполнитель</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {selectedTask.assignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{selectedTask.assignee.name}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Срок</p>
                  </div>
                  <p className={cn('font-medium mt-1', getDueDateStatus(selectedTask.dueDate).color)}>
                    {format(selectedTask.dueDate, 'EEEE, d MMMM', { locale: ru })}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-foreground mb-2">История</p>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    <div className="flex gap-3 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Задача создана</p>
                        <p className="text-muted-foreground">{formatDistanceToNow(selectedTask.dueDate, { addSuffix: true, locale: ru })}</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedTask.status}
                  onValueChange={(v) => handleStatusChange(selectedTask.id, v as Task['status'])}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="waiting">Ожидание</SelectItem>
                    <SelectItem value="completed">Завершена</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm">Удалить</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
