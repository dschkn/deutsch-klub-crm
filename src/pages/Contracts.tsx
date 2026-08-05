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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Search,
  Download,
  Upload,
  FileText,
  Trash2,
  Eye,
  Copy,
  FileDown,
} from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  fileName: string;
  language: 'ru' | 'de' | 'en';
  groupType: 'standard' | 'individual' | 'online';
  ageGroup: 'adult' | 'child' | 'teen';
  sortOrder: number;
  variables: string[];
  createdAt: Date;
}

const initialTemplates: ContractTemplate[] = [
  {
    id: '1',
    name: 'Договор обучения (взрослые)',
    fileName: 'contract_adult_ru.docx',
    language: 'ru',
    groupType: 'standard',
    ageGroup: 'adult',
    sortOrder: 1,
    variables: ['{currentDate}', '{number}', '{studentFIO}', '{studentDate}', '{passport}', '{address}', '{email}', '{phone}', '{level}', '{volume}', '{duration}', '{price}', '{#days}{.}{/days}', '{admin}'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Договор обучения (дети)',
    fileName: 'contract_child_ru.docx',
    language: 'ru',
    groupType: 'standard',
    ageGroup: 'child',
    sortOrder: 2,
    variables: ['{currentDate}', '{number}', '{studentFIO}', '{studentDate}', '{parentFIO}', '{parentDate}', '{parentPassport}', '{parentPhone}', '{level}', '{volume}', '{price}', '{admin}'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Vertrag (Erwachsene)',
    fileName: 'contract_adult_de.docx',
    language: 'de',
    groupType: 'standard',
    ageGroup: 'adult',
    sortOrder: 3,
    variables: ['{currentDate}', '{number}', '{studentFIO}', '{email}', '{phone}', '{level}', '{volume}', '{price}'],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Договор индивидуальное обучение',
    fileName: 'contract_individual_ru.docx',
    language: 'ru',
    groupType: 'individual',
    ageGroup: 'adult',
    sortOrder: 4,
    variables: ['{currentDate}', '{number}', '{studentFIO}', '{email}', '{phone}', '{level}', '{duration}', '{price}'],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'Договор онлайн-обучение',
    fileName: 'contract_online_ru.docx',
    language: 'ru',
    groupType: 'online',
    ageGroup: 'adult',
    sortOrder: 5,
    variables: ['{currentDate}', '{number}', '{studentFIO}', '{email}', '{phone}', '{level}', '{volume}', '{price}'],
    createdAt: new Date('2024-03-01'),
  },
];

const languageConfig = {
  ru: { label: 'Русский', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  de: { label: 'Немецкий', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  en: { label: 'Английский', color: 'bg-green-50 text-green-700 border-green-200' },
};

const groupTypeConfig = {
  standard: { label: 'Групповое', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  individual: { label: 'Индивидуальное', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  online: { label: 'Онлайн', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

const ageGroupConfig = {
  adult: { label: 'Взрослые' },
  child: { label: 'Дети' },
  teen: { label: 'Подростки' },
};

export default function Contracts() {
  const [templates] = useState<ContractTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [activeTab, setActiveTab] = useState('templates');

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || t.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const variablesList = [
    { group: 'Общие данные', vars: ['{currentDate}', '{number}', '{studentFIO}', '{studentDate}', '{passport}', '{passportWho}', '{address}', '{email}', '{phone}', '{level}', '{volume}', '{duration}', '{price}', '{#days}{.}{/days}', '{middle}', '{#months}{.}{/months}', '{#dates}{.}{/dates}', '{admin}', '{proxy}'] },
    { group: 'Данные родителей', vars: ['{parentFIO}', '{parentDate}', '{parentPassport}', '{parentPassportWho}', '{parentAddress}', '{parentEmail}', '{parentPhone}'] },
    { group: 'Данные организации', vars: ['{orgName}', '{orgBoss}', '{orgLegalAddress}', '{orgAddress}', '{orgInn}', '{orgKpp}', '{orgOgrn}', '{orgOkpo}', '{orgOkato}', '{orgBank}', '{orgRs}', '{orgKs}', '{orgBik}', '{orgOkved}', '{orgPhone}', '{orgEmail}'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Договоры</h1>
          <p className="text-muted-foreground mt-0.5">Управление шаблонами и договорами</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Загрузить шаблон
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Загрузка шаблона договора</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Название шаблона</Label>
                <Input placeholder="Название" />
              </div>
              <div className="grid gap-2">
                <Label>Файл (DOCX)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <FileDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Перетащите файл сюда или нажмите для выбора</p>
                  <p className="text-xs text-muted-foreground mt-1">Только файлы .docx</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Язык</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="de">Немецкий</SelectItem>
                      <SelectItem value="en">Английский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Тип группы</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Групповое</SelectItem>
                      <SelectItem value="individual">Индивидуальное</SelectItem>
                      <SelectItem value="online">Онлайн</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Возрастная группа</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Взрослые</SelectItem>
                    <SelectItem value="teen">Подростки</SelectItem>
                    <SelectItem value="child">Дети</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Сортировка</Label>
                <Input type="number" defaultValue="1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Отмена</Button>
              <Button>Загрузить</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Шаблоны договоров</TabsTrigger>
          <TabsTrigger value="contracts">Договоры</TabsTrigger>
          <TabsTrigger value="variables">Переменные</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardHeader className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск шаблонов..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все языки</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="de">Немецкий</SelectItem>
                    <SelectItem value="en">Английский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium text-muted-foreground">Название</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Файл</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Язык</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Тип</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Возраст</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Сортировка</TableHead>
                    <TableHead className="w-32 text-xs font-medium text-muted-foreground text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id} className="group cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{template.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{template.fileName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={languageConfig[template.language].color}>
                          {languageConfig[template.language].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={groupTypeConfig[template.groupType].color}>
                          {groupTypeConfig[template.groupType].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ageGroupConfig[template.ageGroup].label}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{template.sortOrder}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Раздел в разработке</h3>
              <p className="text-sm text-muted-foreground mt-1">Здесь будет отображаться список созданных договоров</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="mt-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardHeader className="p-4 border-b border-border/50">
              <CardTitle className="text-base">Переменные шаблона</CardTitle>
              <p className="text-sm text-muted-foreground">Используйте эти переменные в шаблонах .docx файлов для автоматической подстановки данных</p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {variablesList.map((group) => (
                  <div key={group.group}>
                    <h4 className="text-sm font-medium text-foreground mb-3">{group.group}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {group.vars.map((v) => (
                        <div
                          key={v}
                          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2"
                        >
                          <code className="text-xs text-muted-foreground flex-1 truncate">{v}</code>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
