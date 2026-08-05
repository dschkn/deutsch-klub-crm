import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  BarChart3,
  Briefcase,
  XCircle,
  HelpCircle,
  Calendar,
  CheckSquare,
  CreditCard,
  Users,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DictionaryItem {
  id: string;
  value: string;
  description?: string;
  sortOrder: number;
}

interface Dictionary {
  id: string;
  name: string;
  icon: typeof Clock;
  items: DictionaryItem[];
}

const initialDictionaries: Dictionary[] = [
  {
    id: 'duration',
    name: 'Длительность занятий',
    icon: Clock,
    items: [
      { id: '1', value: '45 минут', sortOrder: 1 },
      { id: '2', value: '60 минут', sortOrder: 2 },
      { id: '3', value: '90 минут', sortOrder: 3 },
      { id: '4', value: '120 минут', sortOrder: 4 },
    ],
  },
  {
    id: 'levels',
    name: 'Уровни',
    icon: BarChart3,
    items: [
      { id: '1', value: 'A1', description: 'Начальный', sortOrder: 1 },
      { id: '2', value: 'A2', description: 'Элементарный', sortOrder: 2 },
      { id: '3', value: 'B1', description: 'Средний', sortOrder: 3 },
      { id: '4', value: 'B2', description: 'Средне-продвинутый', sortOrder: 4 },
      { id: '5', value: 'C1', description: 'Продвинутый', sortOrder: 5 },
      { id: '6', value: 'C2', description: 'В совершенстве', sortOrder: 6 },
    ],
  },
  {
    id: 'professions',
    name: 'Профессии',
    icon: Briefcase,
    items: [
      { id: '1', value: 'IT-специалист', sortOrder: 1 },
      { id: '2', value: 'Менеджер', sortOrder: 2 },
      { id: '3', value: 'Студент', sortOrder: 3 },
      { id: '4', value: 'Педагог', sortOrder: 4 },
      { id: '5', value: 'Медработник', sortOrder: 5 },
    ],
  },
  {
    id: 'rejection_reasons',
    name: 'Причины отказа',
    icon: XCircle,
    items: [
      { id: '1', value: 'Высокая цена', sortOrder: 1 },
      { id: '2', value: 'Неудобное расписание', sortOrder: 2 },
      { id: '3', value: 'Выбрал другого', sortOrder: 3 },
      { id: '4', value: 'Нет времени', sortOrder: 4 },
    ],
  },
  {
    id: 'sources',
    name: 'Откуда узнали',
    icon: HelpCircle,
    items: [
      { id: '1', value: 'Instagram', sortOrder: 1 },
      { id: '2', value: 'VK', sortOrder: 2 },
      { id: '3', value: 'Google', sortOrder: 3 },
      { id: '4', value: 'Рекомендация', sortOrder: 4 },
      { id: '5', value: 'Сайт', sortOrder: 5 },
      { id: '6', value: 'Яндекс', sortOrder: 6 },
    ],
  },
  {
    id: 'course_types',
    name: 'Типы спецкурсов',
    icon: BookOpen,
    items: [
      { id: '1', value: 'Грамматика', sortOrder: 1 },
      { id: '2', value: 'Разговорный', sortOrder: 2 },
      { id: '3', value: 'Деловой', sortOrder: 3 },
      { id: '4', value: 'Подготовка к экзамену', sortOrder: 4 },
    ],
  },
  {
    id: 'holidays',
    name: 'Выходные',
    icon: Calendar,
    items: [
      { id: '1', value: '1 января - Новый год', sortOrder: 1 },
      { id: '2', value: '8 марта', sortOrder: 2 },
      { id: '3', value: '9 мая', sortOrder: 3 },
    ],
  },
  {
    id: 'task_templates',
    name: 'Шаблоны задач',
    icon: CheckSquare,
    items: [
      { id: '1', value: 'Позвонить клиенту', sortOrder: 1 },
      { id: '2', value: 'Отправить материалы', sortOrder: 2 },
      { id: '3', value: 'Подготовить договор', sortOrder: 3 },
    ],
  },
  {
    id: 'payment_assignments',
    name: 'Назначения платежей',
    icon: CreditCard,
    items: [
      { id: '1', value: 'Обучение', sortOrder: 1 },
      { id: '2', value: 'Учебники', sortOrder: 2 },
      { id: '3', value: 'Экзамен', sortOrder: 3 },
      { id: '4', value: 'Клуб', sortOrder: 4 },
    ],
  },
  {
    id: 'payment_recipients',
    name: 'Получатели платежей',
    icon: Users,
    items: [
      { id: '1', value: 'ООО "Дойч-Клуб"', sortOrder: 1 },
      { id: '2', value: 'ИП Иванов И.И.', sortOrder: 2 },
    ],
  },
  {
    id: 'textbooks',
    name: 'Учебники',
    icon: BookOpen,
    items: [
      { id: '1', value: 'Menschen A1', sortOrder: 1 },
      { id: '2', value: 'Menschen A2', sortOrder: 2 },
      { id: '3', value: 'Netzwerk B1', sortOrder: 3 },
      { id: '4', value: 'English File B1', sortOrder: 4 },
      { id: '5', value: 'Nuevo Ven A1', sortOrder: 5 },
    ],
  },
];

export default function Dictionaries() {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>(initialDictionaries);
  const [selectedDict, setSelectedDict] = useState<Dictionary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<DictionaryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredItems = selectedDict?.items.filter(item =>
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddItem = (value: string) => {
    if (!selectedDict || !value.trim()) return;
    const newItem: DictionaryItem = {
      id: Date.now().toString(),
      value: value.trim(),
      sortOrder: selectedDict.items.length + 1,
    };
    setDictionaries(prev => prev.map(d =>
      d.id === selectedDict.id
        ? { ...d, items: [...d.items, newItem] }
        : d
    ));
    setSelectedDict(prev => prev ? { ...prev, items: [...prev.items, newItem] } : null);
    setIsAdding(false);
  };

  const handleEditItem = (itemId: string, newValue: string) => {
    if (!selectedDict || !newValue.trim()) return;
    setDictionaries(prev => prev.map(d =>
      d.id === selectedDict.id
        ? { ...d, items: d.items.map(i => i.id === itemId ? { ...i, value: newValue } : i) }
        : d
    ));
    setSelectedDict(prev => prev
      ? { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, value: newValue } : i) }
      : null
    );
    setEditItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedDict) return;
    setDictionaries(prev => prev.map(d =>
      d.id === selectedDict.id
        ? { ...d, items: d.items.filter(i => i.id !== itemId) }
        : d
    ));
    setSelectedDict(prev => prev
      ? { ...prev, items: prev.items.filter(i => i.id !== itemId) }
      : null
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Справочники</h1>
          <p className="text-muted-foreground mt-0.5">Управление справочными данными системы</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Dictionary List */}
        <Card className="w-72 flex-shrink-0 bg-card/80 backdrop-blur-sm border-border/60">
          <CardHeader className="p-4 border-b border-border/50">
            <CardTitle className="text-base">Список справочников</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="p-2 space-y-1">
              {dictionaries.map((dict) => {
                const Icon = dict.icon;
                return (
                  <button
                    key={dict.id}
                    onClick={() => setSelectedDict(dict)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all duration-150 flex items-center gap-3',
                      selectedDict?.id === dict.id
                        ? 'bg-blue-50/80 border border-blue-200/60'
                        : 'hover:bg-muted border border-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground text-sm">{dict.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {dict.items.length}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel - Dictionary Items */}
        <Card className="flex-1 bg-card/80 backdrop-blur-sm border-border/60">
          {selectedDict ? (
            <>
              <CardHeader className="p-4 border-b border-border/50 flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{selectedDict.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {selectedDict.items.length} значений
                  </p>
                </div>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Добавить
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Добавить значение</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Значение</Label>
                        <Input
                          placeholder="Введите значение"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddItem(e.currentTarget.value);
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAdding(false)}>Отмена</Button>
                        <Button onClick={() => {
                          const input = document.querySelector('input[placeholder="Введите значение"]') as HTMLInputElement;
                          handleAddItem(input?.value || '');
                        }}>Добавить</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12 text-xs font-medium text-muted-foreground">№</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Значение</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">Описание</TableHead>
                        <TableHead className="w-24 text-xs font-medium text-muted-foreground text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => (
                        <TableRow key={item.id} className="group">
                          <TableCell className="text-sm text-muted-foreground">{index + 1}</TableCell>
                          <TableCell>
                            {editItem?.id === item.id ? (
                              <Input
                                defaultValue={item.value}
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditItem(item.id, e.currentTarget.value);
                                  } else if (e.key === 'Escape') {
                                    setEditItem(null);
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-sm font-medium text-foreground">{item.value}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                onClick={() => setEditItem(item)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            Значения не найдены
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center h-[calc(100vh-14rem)]">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Выберите справочник</h3>
                <p className="text-sm text-muted-foreground mt-1">Выберите справочник из списка слева</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
