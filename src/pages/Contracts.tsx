import { useEffect, useRef, useState } from 'react';
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
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
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
  Loader2,
  X,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type ContractTemplate,
  type Lang,
  type GroupCategory,
  type AgeBracket,
  useContractTemplates,
  addTemplate,
  updateTemplate,
  duplicateTemplate,
  removeTemplate,
  ensureRealTemplateLoaded,
  languageConfig,
  groupCategoryConfig,
  ageBracketConfig,
  loopLabels,
} from '../data/contractTemplatesStore';
import { cn } from '../lib/utils';
import {
  fileToBase64,
  extractTemplateVariables,
  downloadBase64,
} from '../lib/docxTemplate';

const allGroupCategories: GroupCategory[] = ['standard', 'mini', 'special', 'individual'];
const allAgeBrackets: AgeBracket[] = ['child', 'teen', 'adult'];

const variablesList = [
  { group: 'Общие данные', vars: ['{currentDate}', '{number}', '{studentFIO}', '{studentDate}', '{passport}', '{passportWho}', '{address}', '{email}', '{phone}', '{level}', '{volume}', '{duration}', '{price}', '{#days}{.}{/days}', '{admin}', '{proxy}'] },
  { group: 'Данные родителей', vars: ['{parentFIO}', '{parentDate}', '{parentPassport}', '{parentPassportWho}', '{parentAddress}', '{parentEmail}', '{parentPhone}'] },
  { group: 'Данные организации', vars: ['{orgName}', '{orgBoss}', '{orgLegalAddress}', '{orgAddress}', '{orgInn}', '{orgKpp}', '{orgOgrn}', '{orgOkpo}', '{orgOkato}', '{orgBank}', '{orgRs}', '{orgKs}', '{orgBik}', '{orgOkved}', '{orgPhone}', '{orgEmail}'] },
];

interface TemplateFormState {
  name: string;
  language: Lang;
  sortOrder: number;
  groupCategories: GroupCategory[];
  ageBrackets: AgeBracket[];
}

const emptyForm: TemplateFormState = {
  name: '',
  language: 'ru',
  sortOrder: 1,
  groupCategories: [],
  ageBrackets: [],
};

export default function Contracts() {
  const templates = useContractTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    ensureRealTemplateLoaded();
  }, []);

  // ---------- Создание / редактирование шаблона ----------
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openCreateDialog() {
    setForm({ ...emptyForm, sortOrder: templates.length + 1 });
    setFile(null);
    setEditingId(null);
    setDialogMode('create');
  }

  function openEditDialog(t: ContractTemplate) {
    setForm({
      name: t.name,
      language: t.language,
      sortOrder: t.sortOrder,
      groupCategories: t.groupCategories,
      ageBrackets: t.ageBrackets,
    });
    setFile(null);
    setEditingId(t.id);
    setDialogMode('edit');
  }

  function closeDialog() {
    setDialogMode(null);
    setEditingId(null);
    setFile(null);
    setIsDragging(false);
  }

  function handleFileChosen(f: File) {
    if (!f.name.toLowerCase().endsWith('.docx')) {
      toast.error('Поддерживаются только файлы .docx');
      return;
    }
    setFile(f);
    if (!form.name.trim()) {
      setForm((prev) => ({ ...prev, name: f.name.replace(/\.docx$/i, '') }));
    }
  }

  function toggleCategory(cat: GroupCategory) {
    setForm((prev) => ({
      ...prev,
      groupCategories: prev.groupCategories.includes(cat)
        ? prev.groupCategories.filter((c) => c !== cat)
        : [...prev.groupCategories, cat],
    }));
  }

  function toggleBracket(b: AgeBracket) {
    setForm((prev) => ({
      ...prev,
      ageBrackets: prev.ageBrackets.includes(b)
        ? prev.ageBrackets.filter((x) => x !== b)
        : [...prev.ageBrackets, b],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Укажите название шаблона');
      return;
    }
    if (dialogMode === 'create' && !file) {
      toast.error('Выберите файл шаблона');
      return;
    }
    if (form.groupCategories.length === 0 || form.ageBrackets.length === 0) {
      toast.error('Выберите хотя бы один тип группы и одну возрастную категорию');
      return;
    }

    setIsSaving(true);
    try {
      if (dialogMode === 'create') {
        const base64 = await fileToBase64(file as File);
        const { fields, loops } = extractTemplateVariables(base64);
        if (fields.length === 0 && loops.length === 0) {
          toast.warning('В файле не найдено переменных вида {name} — шаблон сохранён, но автозаполнение работать не будет');
        }
        addTemplate({
          id: Date.now().toString(),
          name: form.name.trim(),
          fileName: (file as File).name,
          language: form.language,
          groupCategories: form.groupCategories,
          ageBrackets: form.ageBrackets,
          sortOrder: form.sortOrder,
          fileBase64: base64,
          fields,
          loops,
          createdAt: new Date(),
        });
        toast.success(`Шаблон «${form.name.trim()}» загружен`);
      } else if (dialogMode === 'edit' && editingId) {
        const patch: Partial<ContractTemplate> = {
          name: form.name.trim(),
          language: form.language,
          sortOrder: form.sortOrder,
          groupCategories: form.groupCategories,
          ageBrackets: form.ageBrackets,
        };
        if (file) {
          const base64 = await fileToBase64(file);
          const { fields, loops } = extractTemplateVariables(base64);
          patch.fileBase64 = base64;
          patch.fileName = file.name;
          patch.fields = fields;
          patch.loops = loops;
        }
        updateTemplate(editingId, patch);
        toast.success(`Шаблон «${form.name.trim()}» обновлён`);
      }
      closeDialog();
    } catch {
      toast.error('Не удалось прочитать файл. Убедитесь, что это корректный .docx');
    } finally {
      setIsSaving(false);
    }
  }

  // ---------- Действия со списком шаблонов ----------
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ContractTemplate | null>(null);

  function handleDownloadTemplate(t: ContractTemplate) {
    if (!t.fileBase64) {
      toast.info('Для этого шаблона ещё не загружен файл .docx');
      return;
    }
    downloadBase64(t.fileBase64, t.fileName);
  }

  function handleConfirmDelete() {
    if (!deleteCandidate) return;
    removeTemplate(deleteCandidate.id);
    toast.success(`Шаблон «${deleteCandidate.name}» удалён`);
    setDeleteCandidate(null);
  }

  function handleCopyVar(v: string) {
    navigator.clipboard
      .writeText(v)
      .then(() => toast.success(`Скопировано: ${v}`))
      .catch(() => toast.error('Не удалось скопировать — скопируйте вручную'));
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || t.language === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Договоры</h1>
          <p className="text-muted-foreground mt-0.5">Управление шаблонами договоров. Формирование конкретного договора — на странице группы, у карточки студента</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Upload className="h-4 w-4" />
          Загрузить шаблон
        </Button>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Редактирование шаблона' : 'Загрузка шаблона договора'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Название шаблона</Label>
              <Input placeholder="Название" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Файл (DOCX){dialogMode === 'edit' && <span className="text-muted-foreground font-normal"> — оставьте пустым, чтобы не менять</span>}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChosen(f);
                  e.target.value = '';
                }}
              />
              {file ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} КБ</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setFile(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-border hover:border-blue-300 hover:bg-muted/50'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileChosen(f);
                  }}
                >
                  <FileDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Перетащите файл сюда или нажмите для выбора</p>
                  <p className="text-xs text-muted-foreground mt-1">Только файлы .docx</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Язык</Label>
                <Select value={form.language} onValueChange={(v) => setForm((p) => ({ ...p, language: v as Lang }))}>
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
                <Label>Сортировка</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Язык договора определяет, каким группам он подходит: «Русский» — универсальный, показывается для групп любого языка обучения; «Немецкий»/«Английский» — только для групп с этим языком курса
            </p>
            <div className="grid gap-2">
              <Label>Показывать для групп</Label>
              <div className="grid grid-cols-2 gap-2">
                {allGroupCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={form.groupCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
                    <span className="text-sm">{groupCategoryConfig[cat].label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Возраст</Label>
              <div className="grid grid-cols-3 gap-2">
                {allAgeBrackets.map((b) => (
                  <label key={b} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={form.ageBrackets.includes(b)} onCheckedChange={() => toggleBracket(b)} />
                    <span className="text-sm">{ageBracketConfig[b].label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                По этим двум признакам система будет подбирать шаблон на странице группы
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeDialog}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {dialogMode === 'edit' ? 'Сохранить' : 'Загрузить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Шаблоны договоров</TabsTrigger>
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
                    <TableHead className="text-xs font-medium text-muted-foreground">Язык</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Группы</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Возраст</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground">Сортировка</TableHead>
                    <TableHead className="w-48 text-xs font-medium text-muted-foreground text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id} className="group cursor-pointer" onClick={() => setPreviewTemplate(template)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="font-medium text-foreground">{template.name}</span>
                            <p className="text-xs text-muted-foreground font-mono">{template.fileName}</p>
                          </div>
                          {!template.fileBase64 && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              без файла
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={languageConfig[template.language].color}>
                          {languageConfig[template.language].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.groupCategories.map((c) => (
                            <Badge key={c} variant="outline" className={cn('text-[10px]', groupCategoryConfig[c].color)}>
                              {groupCategoryConfig[c].label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.ageBrackets.map((b) => (
                            <Badge key={b} variant="outline" className="text-[10px]">
                              {ageBracketConfig[b].label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{template.sortOrder}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => setPreviewTemplate(template)}
                            title="Просмотр переменных"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDownloadTemplate(template)}
                            title="Скачать файл"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => openEditDialog(template)}
                            title="Редактировать"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => duplicateTemplate(template.id)}
                            title="Дублировать"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                            onClick={() => setDeleteCandidate(template)}
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Шаблоны не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                        <button
                          key={v}
                          onClick={() => handleCopyVar(v)}
                          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                        >
                          <code className="text-xs text-muted-foreground flex-1 truncate">{v}</code>
                          <Copy className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Просмотр шаблона */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <FileText className="h-4 w-4" />
                {previewTemplate.fileName}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {previewTemplate.groupCategories.map((c) => (
                  <Badge key={c} variant="outline" className={groupCategoryConfig[c].color}>
                    {groupCategoryConfig[c].label}
                  </Badge>
                ))}
                {previewTemplate.ageBrackets.map((b) => (
                  <Badge key={b} variant="outline">
                    {ageBracketConfig[b].label}
                  </Badge>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Переменные ({previewTemplate.fields.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewTemplate.fields.length === 0 && (
                    <span className="text-sm text-muted-foreground">Не найдены</span>
                  )}
                  {previewTemplate.fields.map((f) => (
                    <Badge key={f} variant="outline" className="font-mono text-[11px]">
                      {`{${f}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              {previewTemplate.loops.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Разделы-списки</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewTemplate.loops.map((l) => (
                      <Badge key={l} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[11px]">
                        {loopLabels[l] || l}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="gap-2" onClick={() => openEditDialog(previewTemplate)}>
                  <Pencil className="h-4 w-4" />
                  Редактировать
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => handleDownloadTemplate(previewTemplate)}>
                  <Download className="h-4 w-4" />
                  Скачать файл
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Подтверждение удаления */}
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription>
              Шаблон «{deleteCandidate?.name}» будет удалён из списка. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
