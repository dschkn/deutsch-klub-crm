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
  DoorOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  useDictionaries,
  addDictionaryItem,
  updateDictionaryItem,
  removeDictionaryItem,
  type Dictionary,
  type DictionaryItem,
} from '../data/dictionariesStore';

const dictionaryIcons: Record<string, typeof Clock> = {
  duration: Clock,
  levels: BarChart3,
  professions: Briefcase,
  rejection_reasons: XCircle,
  sources: HelpCircle,
  course_types: BookOpen,
  holidays: Calendar,
  task_templates: CheckSquare,
  audiences: DoorOpen,
  textbooks: BookOpen,
};

export default function Dictionaries() {
  const dictionaries = useDictionaries();
  const [selectedDictId, setSelectedDictId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<DictionaryItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const selectedDict = dictionaries.find(d => d.id === selectedDictId) || null;

  const filteredItems = (selectedDict
    ? [...selectedDict.items].sort((a, b) => a.sortOrder - b.sortOrder)
    : []
  ).filter(item => item.value.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddItem = (value: string) => {
    if (!selectedDict || !value.trim()) return;
    addDictionaryItem(selectedDict.id, value.trim());
    setIsAdding(false);
  };

  const handleEditItem = (itemId: string, newValue: string) => {
    if (!selectedDict || !newValue.trim()) return;
    updateDictionaryItem(selectedDict.id, itemId, newValue.trim());
    setEditItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedDict) return;
    removeDictionaryItem(selectedDict.id, itemId);
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
                const Icon = dictionaryIcons[dict.id] || BookOpen;
                return (
                  <button
                    key={dict.id}
                    onClick={() => setSelectedDictId(dict.id)}
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
                        <TableHead className="w-24 text-xs font-medium text-muted-foreground text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, index) => (
                        <TableRow key={item.id}>
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
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setEditItem(item)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
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
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
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
