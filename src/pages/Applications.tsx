import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Plus,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  PhoneCall,
  Instagram,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  FileInput,
} from 'lucide-react';
import { users } from '../data/sampleData';
import { getAllApplications } from '../data/selectors';
import { Application, ApplicationHistoryItem } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '../lib/utils';

const sourceConfig: Record<Application['source'], { label: string; icon: typeof MessageSquare; color: string }> = {
  vk: { label: 'ВКонтакте', icon: Globe, color: 'text-blue-500 bg-blue-50' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500 bg-green-50' },
  telegram: { label: 'Telegram', icon: Phone, color: 'text-sky-500 bg-sky-50' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-500 bg-pink-50' },
  website: { label: 'Сайт', icon: Globe, color: 'text-slate-500 bg-slate-100' },
  mango_office: { label: 'Mango Office', icon: PhoneCall, color: 'text-orange-500 bg-orange-50' },
};

const statusConfig: Record<Application['status'], { label: string; color: string; dotColor: string }> = {
  new: { label: 'Новая', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  in_progress: { label: 'В работе', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  contacted: { label: 'Связались', color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
  trial_lesson: { label: 'Пробное занятие', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-500' },
  enrolled: { label: 'Записан', color: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  rejected: { label: 'Отказ', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
};

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>(() => {
    const fromStore = getAllApplications();
    if (fromStore.length > 0) return fromStore;
    // Fallback: generate mock data if store is empty
    const apps: Application[] = [];
    const sources: Application['source'][] = ['vk', 'whatsapp', 'telegram', 'instagram', 'website', 'mango_office'];
    const statuses: Application['status'][] = ['new', 'in_progress', 'contacted', 'trial_lesson', 'enrolled', 'rejected'];
    const names = Array.from({ length: 8 }, (_, index) => `Тестовый клиент ${String(index + 1).padStart(2, '0')}`);
    for (let i = 0; i < 25; i++) {
      apps.push({
        id: `app-${i + 1}`,
        name: names[Math.floor(Math.random() * names.length)],
        phone: `+1 202-555-${String(150 + i).padStart(4, '0')}`,
        email: Math.random() > 0.5 ? `user${i + 1}@example.com` : undefined,
        source: sources[Math.floor(Math.random() * sources.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        comment: Math.random() > 0.6 ? 'Интересует немецкий язык, уровень А1' : undefined,
        assignedManager: Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : undefined,
        isNewClient: Math.random() > 0.3,
        relatedStudentId: Math.random() > 0.7 ? `student-${Math.floor(Math.random() * 50)}` : undefined,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        history: [{
          id: `h-${i}-1`,
          type: 'status_change',
          content: 'Заявка создана',
          user: users[0],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }],
      });
    }
    return apps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    const matchesSource = filterSource === 'all' || app.source === filterSource;
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const stats = {
    new: applications.filter(a => a.status === 'new').length,
    inProgress: applications.filter(a => a.status === 'in_progress').length,
    trial: applications.filter(a => a.status === 'trial_lesson').length,
    enrolled: applications.filter(a => a.status === 'enrolled').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const handleStatusChange = (appId: string, newStatus: Application['status']) => {
    setApplications(prev => prev.map(a => {
      if (a.id === appId) {
        const newHistory: ApplicationHistoryItem = {
          id: `h-${Date.now()}`,
          type: 'status_change',
          content: `Статус изменен на "${statusConfig[newStatus].label}"`,
          user: users[0],
          createdAt: new Date(),
        };
        return { ...a, status: newStatus, updatedAt: new Date(), history: [...a.history, newHistory] };
      }
      return a;
    }));
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? {
        ...prev,
        status: newStatus,
        updatedAt: new Date(),
        history: [...prev.history, {
          id: `h-${Date.now()}`,
          type: 'status_change',
          content: `Статус изменен на "${statusConfig[newStatus].label}"`,
          user: users[0],
          createdAt: new Date(),
        }]
      } : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Заявки</h1>
          <p className="text-muted-foreground mt-0.5">Единое окно для обработки всех обращений клиентов</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Создать заявку
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileInput className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
                <p className="text-xs text-blue-600">Новые</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{stats.inProgress}</p>
                <p className="text-xs text-amber-600">В работе</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50/50 border-cyan-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cyan-700">{stats.trial}</p>
                <p className="text-xs text-cyan-600">Пробное занятие</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.enrolled}</p>
                <p className="text-xs text-green-600">Записаны</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                <p className="text-xs text-red-600">Отказ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или телефону..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Источник" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все источники</SelectItem>
            {Object.entries(sourceConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(statusConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Список заявок */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/60">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-28rem)]">
            <div className="divide-y divide-slate-100">
              {filteredApplications.map((app) => {
                const source = sourceConfig[app.source];
                const status = statusConfig[app.status];
                const Icon = source.icon;
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${source.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{app.name}</p>
                        {app.isNewClient && (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                            Новый клиент
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{app.phone}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={status.color}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor} mr-1.5`} />
                        {status.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(app.createdAt, { addSuffix: true, locale: ru })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredApplications.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Заявки не найдены
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Диалог деталей заявки */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                Заявка #{selectedApp.id.split('-')[1]}
                <Badge variant="outline" className={statusConfig[selectedApp.status].color}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[selectedApp.status].dotColor} mr-1.5`} />
                  {statusConfig[selectedApp.status].label}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Информация о клиенте */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                      {selectedApp.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{selectedApp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedApp.isNewClient ? 'Новый клиент' : 'Повторный клиент'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedApp.phone}
                  </div>
                  {selectedApp.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedApp.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {(() => {
                      const src = sourceConfig[selectedApp.source];
                      const Icon = src.icon;
                      return <>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {src.label}
                      </>;
                    })()}
                  </div>
                  {selectedApp.assignedManager && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedApp.assignedManager.name}
                    </div>
                  )}
                </div>

                {selectedApp.comment && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">{selectedApp.comment}</p>
                  </>
                )}
              </div>

              {/* Изменение статуса */}
              <div className="grid grid-cols-3 gap-2">
                {['trial_lesson', 'enrolled', 'rejected'].map((s) => {
                  const status = statusConfig[s as Application['status']];
                  return (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'justify-start',
                        selectedApp.status === s && 'ring-2 ring-blue-200'
                      )}
                      onClick={() => handleStatusChange(selectedApp.id, s as Application['status'])}
                    >
                      <span className={`h-2 w-2 rounded-full ${status.dotColor} mr-2`} />
                      {status.label}
                    </Button>
                  );
                })}
              </div>

              {/* История */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">История</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {selectedApp.history.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <div className="text-muted-foreground text-xs w-20 flex-shrink-0">
                          {format(item.createdAt, 'dd.MM.yyyy HH:mm')}
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground">{item.content}</p>
                          <p className="text-xs text-muted-foreground">{item.user.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Добавить комментарий */}
              <div className="flex gap-2">
                <Textarea placeholder="Добавить комментарий..." className="flex-1 min-h-[60px]" />
                <Button className="self-end">Отправить</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
