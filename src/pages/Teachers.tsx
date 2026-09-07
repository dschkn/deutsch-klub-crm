import { useEffect, useMemo, useState } from 'react';
import { BookOpen, BriefcaseBusiness, Mail, Pencil, Phone, Plus, Search, UserCheck, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { getAllGroups } from '../data/selectors';
import { getTeacherDirectory, saveTeacherDirectory, subscribeToTeacherDirectory, type TeacherDirectoryEntry, type TeacherLanguage } from '../data/teacherDirectory';

const emptyTeacher = (): TeacherDirectoryEntry => ({ id: '', name: '', email: '', phone: '', languages: ['German'], employmentType: 'hourly', format: 'both', active: true, note: '', createdAt: new Date().toISOString() });
const languageLabel = { German: 'Немецкий', English: 'Английский' };
const employmentLabel = { full_time: 'Штат', part_time: 'Частичная занятость', hourly: 'Почасовая оплата' };
const formatLabel = { offline: 'Офлайн', online: 'Онлайн', both: 'Онлайн и офлайн' };

export default function Teachers() {
  const [teachers, setTeachers] = useState(getTeacherDirectory);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'active' | 'dismissed'>('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<TeacherDirectoryEntry>(emptyTeacher);
  const [dismissTarget, setDismissTarget] = useState<TeacherDirectoryEntry | null>(null);
  const groups = useMemo(() => getAllGroups(), []);

  useEffect(() => subscribeToTeacherDirectory(() => setTeachers(getTeacherDirectory())), []);
  const filtered = teachers.filter(t => t.active === (status === 'active') && `${t.name} ${t.email} ${t.phone}`.toLowerCase().includes(query.trim().toLowerCase()));
  const persist = (next: TeacherDirectoryEntry[]) => { setTeachers(next); saveTeacherDirectory(next); };
  const activeGroupCount = (teacher: TeacherDirectoryEntry) => groups.filter(g => g.teacher.id === teacher.id && g.status === 'active').length;

  const saveDraft = () => {
    const name = draft.name.trim();
    const email = draft.email.trim();
    if (!name) return toast.error('Укажите имя преподавателя');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return toast.error('Проверьте e-mail преподавателя');
    if (teachers.some(t => t.id !== draft.id && t.name.toLowerCase() === name.toLowerCase())) return toast.error('Преподаватель с таким именем уже есть');
    const entry = { ...draft, id: draft.id || `teacher-${Date.now()}`, name, email };
    persist(draft.id ? teachers.map(t => t.id === draft.id ? entry : t) : [entry, ...teachers]);
    setDialogOpen(false);
    toast.success(draft.id ? 'Данные преподавателя обновлены' : 'Преподаватель добавлен');
  };
  const changeLanguage = (language: TeacherLanguage) => {
    const has = draft.languages.includes(language);
    if (has && draft.languages.length === 1) return;
    setDraft({ ...draft, languages: has ? draft.languages.filter(l => l !== language) : [...draft.languages, language] });
  };
  const dismiss = () => {
    if (!dismissTarget) return;
    persist(teachers.map(t => t.id === dismissTarget.id ? { ...t, active: false } : t));
    setDismissTarget(null);
    toast.success('Преподаватель убран из активного списка');
  };
  const restore = (teacher: TeacherDirectoryEntry) => {
    persist(teachers.map(t => t.id === teacher.id ? { ...t, active: true } : t));
    toast.success('Преподаватель восстановлен');
  };
  const uploadAvatar = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Выберите изображение');
    if (file.size > 2 * 1024 * 1024) return toast.error('Фотография должна быть меньше 2 МБ');
    const reader = new FileReader();
    reader.onload = () => setDraft(current => ({ ...current, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Команда</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Учителя</h1></div>
      <Button onClick={() => { setDraft(emptyTeacher()); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Добавить учителя</Button>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="border-l-2 border-emerald-500 px-4 py-2"><div className="text-2xl font-semibold">{teachers.filter(t => t.active).length}</div><div className="text-sm text-muted-foreground">работают сейчас</div></div>
      <div className="border-l-2 border-sky-500 px-4 py-2"><div className="text-2xl font-semibold">{groups.filter(g => g.status === 'active').length}</div><div className="text-sm text-muted-foreground">активных групп</div></div>
      <div className="border-l-2 border-violet-500 px-4 py-2"><div className="text-2xl font-semibold">{teachers.filter(t => t.active && t.format !== 'online').length}</div><div className="text-sm text-muted-foreground">доступны офлайн</div></div>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Имя, телефон или e-mail" value={query} onChange={e => setQuery(e.target.value)} /></div>
      <div className="flex border p-1"><button className={`px-4 py-1.5 text-sm ${status === 'active' ? 'bg-foreground text-background' : 'text-muted-foreground'}`} onClick={() => setStatus('active')}>Работают</button><button className={`px-4 py-1.5 text-sm ${status === 'dismissed' ? 'bg-foreground text-background' : 'text-muted-foreground'}`} onClick={() => setStatus('dismissed')}>Уволены</button></div>
    </div>
    <div className="overflow-hidden border">
      <div className="hidden grid-cols-[minmax(220px,1.3fr)_1fr_1fr_160px_112px] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid"><span>Учитель</span><span>Языки</span><span>Контакты</span><span>Нагрузка</span><span className="text-right">Действия</span></div>
      {filtered.map(teacher => <div key={teacher.id} className="grid gap-4 border-b px-5 py-4 last:border-0 md:grid-cols-[minmax(220px,1.3fr)_1fr_1fr_160px_112px] md:items-center">
        <button className="flex items-center gap-3 text-left" onClick={() => { setDraft({ ...teacher }); setDialogOpen(true); }}><Avatar className="h-10 w-10"><AvatarImage src={teacher.avatar} alt={teacher.name} /><AvatarFallback>{teacher.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</AvatarFallback></Avatar><span><span className="block font-medium">{teacher.name}</span><span className="mt-1 block text-xs text-muted-foreground">{employmentLabel[teacher.employmentType]} · {formatLabel[teacher.format]}</span></span></button>
        <div className="flex flex-wrap gap-1">{teacher.languages.map(l => <Badge key={l} variant="outline" className="rounded-none font-normal">{languageLabel[l]}</Badge>)}</div>
        <div className="space-y-1 text-sm text-muted-foreground">{teacher.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{teacher.email}</div>}{teacher.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{teacher.phone}</div>}{!teacher.email && !teacher.phone && 'Нет контактов'}</div>
        <div className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4 text-muted-foreground" />{activeGroupCount(teacher)} активных</div>
        <div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label="Редактировать" onClick={() => { setDraft({ ...teacher }); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>{teacher.active ? <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700" aria-label="Уволить" onClick={() => setDismissTarget(teacher)}><UserMinus className="h-4 w-4" /></Button> : <Button size="icon" variant="ghost" className="text-emerald-600" aria-label="Восстановить" onClick={() => restore(teacher)}><UserCheck className="h-4 w-4" /></Button>}</div>
      </div>)}
      {!filtered.length && <div className="px-5 py-16 text-center text-sm text-muted-foreground">Никого не найдено</div>}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{draft.id ? 'Редактирование учителя' : 'Добавление учителя'}</DialogTitle><DialogDescription>Данные из этого профиля используются в группах и расписании.</DialogDescription></DialogHeader><div className="grid gap-4 py-2 sm:grid-cols-2">
      <div className="flex items-center gap-4 sm:col-span-2"><Avatar className="h-16 w-16"><AvatarImage src={draft.avatar} alt={draft.name} /><AvatarFallback>{draft.name ? draft.name.split(' ').map(part => part[0]).slice(0, 2).join('') : 'ФО'}</AvatarFallback></Avatar><div className="flex flex-wrap gap-2"><Label htmlFor="teacher-photo" className="inline-flex h-9 cursor-pointer items-center border px-4 text-sm font-medium hover:bg-muted">{draft.avatar ? 'Заменить фото' : 'Добавить фото'}</Label><Input id="teacher-photo" className="hidden" type="file" accept="image/*" onChange={event => uploadAvatar(event.target.files?.[0])} />{draft.avatar && <Button type="button" variant="ghost" onClick={() => setDraft({...draft, avatar: undefined})}>Удалить фото</Button>}<p className="w-full text-xs text-muted-foreground">Необязательно · JPG, PNG или WebP · до 2 МБ</p></div></div>
      <div className="space-y-1.5 sm:col-span-2"><Label>Имя и фамилия *</Label><Input autoFocus value={draft.name} onChange={e => setDraft({...draft, name:e.target.value})} placeholder="Анна Иванова" /></div>
      <div className="space-y-1.5"><Label>E-mail</Label><Input type="email" value={draft.email} onChange={e => setDraft({...draft, email:e.target.value})} /></div><div className="space-y-1.5"><Label>Телефон</Label><Input value={draft.phone} onChange={e => setDraft({...draft, phone:e.target.value})} /></div>
      <div className="space-y-1.5"><Label>Занятость</Label><Select value={draft.employmentType} onValueChange={v => setDraft({...draft, employmentType:v as TeacherDirectoryEntry['employmentType']})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(employmentLabel).map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-1.5"><Label>Формат работы</Label><Select value={draft.format} onValueChange={v => setDraft({...draft, format:v as TeacherDirectoryEntry['format']})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(formatLabel).map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2 sm:col-span-2"><Label>Языки</Label><div className="flex gap-2">{(['German','English'] as TeacherLanguage[]).map(l => <Button key={l} type="button" variant={draft.languages.includes(l) ? 'default' : 'outline'} onClick={() => changeLanguage(l)}>{languageLabel[l]}</Button>)}</div></div>
      <div className="space-y-1.5 sm:col-span-2"><Label>Комментарий</Label><Textarea value={draft.note} onChange={e => setDraft({...draft, note:e.target.value})} placeholder="Внутренняя заметка для администраторов" /></div>
    </div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button><Button onClick={saveDraft}>Сохранить</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={!!dismissTarget} onOpenChange={open => !open && setDismissTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Убрать учителя из активного списка?</AlertDialogTitle><AlertDialogDescription>{dismissTarget && activeGroupCount(dismissTarget) > 0 ? `У ${dismissTarget.name} сейчас ${activeGroupCount(dismissTarget)} активных групп. История сохранится, но учитель исчезнет из выбора для новых групп.` : 'История и связанные группы сохранятся. Учителя можно будет восстановить во вкладке «Уволены».'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={dismiss} className="bg-red-600 hover:bg-red-700"><BriefcaseBusiness className="mr-2 h-4 w-4" />Уволить</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
