import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataStore } from '../../data/store';
import { realGroups } from '../../data/realGroups';
import { getTeacherDirectory } from '../../data/teacherDirectory';
import type { ScheduleItem } from '../../types';
import { NormalizedGroup, NormalizedScheduleEntry } from '../../types/normalized';
import { buildCourseOccurrences, endTimeForAcademicHours } from '../../lib/groupSchedule';
import { cn } from '../../lib/utils';

const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const courseTypeOptions = [
  { value: 'group', label: 'Групповая' },
  { value: 'mini', label: 'Мини-группа' },
  { value: 'individual', label: 'Индивидуальная' },
  { value: 'intensive', label: 'Интенсив' },
  { value: 'club', label: 'Клуб' },
  { value: 'grammar', label: 'Грамматика' },
  { value: 'phonetics', label: 'Фонетика' },
  { value: 'language_course', label: 'Языковой курс' },
  { value: 'open_lesson', label: 'Открытый урок' },
];

const levelOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (groupId: string) => void;
}

export default function CreateGroupDialog({ open, onOpenChange, onCreated }: CreateGroupDialogProps) {
  const store = DataStore.getInstance();
  const teachers = getTeacherDirectory().filter(teacher => teacher.active);

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'German' | 'English'>('German');
  const [level, setLevel] = useState('A1');
  const [courseType, setCourseType] = useState('group');
  const [teacherId, setTeacherId] = useState('');
  const [price, setPrice] = useState(8000);
  const [hours, setHours] = useState(72);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [textbook, setTextbook] = useState('');
  const [maxStudents, setMaxStudents] = useState(8);
  const [scheduleEntries, setScheduleEntries] = useState<(Partial<NormalizedScheduleEntry> & { academicHours?: number })[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const classrooms = ['Аудитория 1', 'Аудитория 2', 'Аудитория 3', 'Аудитория 4'];
  const zoomRooms = ['Zoom 1', 'Zoom 2', 'Zoom 3', 'Свой Zoom'];
  const occurrences = useMemo(() => buildCourseOccurrences(new Date(`${startDate}T12:00:00`), hours, scheduleEntries as ScheduleItem[]), [startDate, hours, scheduleEntries]);

  const addScheduleEntry = () => {
    setScheduleEntries(prev => [...prev, { dayOfWeek: 1, startTime: '10:00', endTime: '11:30', academicHours: 2, classroom: 'Аудитория 1' }]);
  };

  const updateScheduleEntry = (index: number, field: keyof NormalizedScheduleEntry | 'academicHours', value: unknown) => {
    setScheduleEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const removeScheduleEntry = (index: number) => {
    setScheduleEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Название группы обязательно');
    if (price <= 0) errs.push('Укажите стоимость');
    if (hours <= 0) errs.push('Укажите количество часов');
    if (scheduleEntries.length === 0) errs.push('Добавьте хотя бы один день занятий');
    scheduleEntries.forEach((entry, index) => {
      const start = (entry.startTime || '10:00').replace(':', '');
      const end = (entry.endTime || '11:30').replace(':', '');
      const resource = entry.classroom || entry.zoomRoom;
      if (!resource) errs.push(`Выберите аудиторию или Zoom для занятия ${index + 1}`);
      if (resource === 'Свой Zoom') return;
      const conflict = realGroups.find(group => group.schedule.some(item => {
        if (item.dayOfWeek !== entry.dayOfWeek) return false;
        const otherStart = item.startTime.replace(':', '');
        const otherEnd = item.endTime.replace(':', '');
        const overlap = start < otherEnd && end > otherStart;
        const sameResource = resource && (item.classroom === resource || item.zoomRoom === resource);
        const sameTeacher = group.teacherId === teacherId;
        return overlap && (sameResource || sameTeacher);
      }));
      if (conflict) errs.push(`Занятие ${index + 1}: ${resource || 'ресурс'} или преподаватель уже заняты группой «${conflict.name}» (#${conflict.code}) — ${dayNames[entry.dayOfWeek ?? 1]} ${entry.startTime}–${entry.endTime}.`);
    });
    setErrors(errs);
    if (errs.length > 0) return;

    const groupNum = store.getNextGroupNumber();
    const code = `26-${groupNum}`;
    const now = new Date();
    const courseStart = new Date(`${startDate}T12:00:00`);
    const courseEnd = occurrences.at(-1)?.date || courseStart;
    const groupId = `grp_${Date.now()}`;

    const schedule: Partial<NormalizedScheduleEntry>[] = scheduleEntries.map((s, i) => ({
      id: `schedule_${groupId}_${i}`,
      groupId,
      dayOfWeek: s.dayOfWeek ?? 1,
      startTime: s.startTime || '10:00',
      endTime: s.endTime || '11:30',
      classroom: s.classroom,
      zoomRoom: s.zoomRoom,
    }));

    const group: NormalizedGroup = {
      id: groupId,
      name: name.trim(),
      code,
      language,
      level,
      courseType,
      hours,
      teacherId: teacherId === '__unassigned__' ? '' : teacherId,
      teacherName: teachers.find(t => t.id === teacherId)?.name || 'Преподаватель не назначен',
      textbook,
      studentIds: [],
      lessonIds: [],
      scheduleIds: schedule.map(s => s.id!),
      contractIds: [],
      paymentIds: [],
      roomId: undefined,
      zoomRoomId: undefined,
      status: 'planned',
      price,
      maxStudents,
      startDate: courseStart,
      endDate: courseEnd,
      createdAt: now,
      updatedAt: now,
    };

    store.addGroup(group);

    // Also add to realGroups for GroupInfoDialog compatibility
    const realSchedule: ScheduleItem[] = scheduleEntries.map(s => ({
      dayOfWeek: s.dayOfWeek ?? 1,
      startTime: s.startTime || '10:00',
      endTime: s.endTime || '11:30',
      academicHours: s.academicHours || 2,
      classroom: s.classroom,
      zoomRoom: s.zoomRoom,
    }));
    realGroups.push({
      id: groupId,
      name: name.trim(),
      code,
      language,
      level,
      courseType,
      hours,
      price,
      teacherId: teacherId === '__unassigned__' ? null : teacherId,
      teacherName: teachers.find(t => t.id === teacherId)?.name || 'Преподаватель не назначен',
      textbook,
      startDate: courseStart,
      endDate: courseEnd,
      schedule: realSchedule,
      studentIds: [],
      maxStudents,
      status: 'planned',
    });

    if (occurrences.length) {
      occurrences.forEach((occurrence, index) => {
        const s = occurrence.schedule;
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        const start = new Date(occurrence.date);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(occurrence.date);
        end.setHours(eh, em, 0, 0);

        store.addScheduleItem({
          id: `real_si_${groupId}_${formatDate(start)}_${index}`,
          teacherId: teacherId === '__unassigned__' ? '' : teacherId,
          groupId,
          lessonType: courseType === 'individual' ? 'individual' : 'lesson',
          start,
          end,
          status: 'planned',
          commentIds: [],
          createdAt: now,
          updatedAt: now,
          groupName: name.trim(),
          groupLevel: level,
          groupLanguage: language,
          courseType,
          format: s.zoomRoom ? 'online' : 'offline',
          teacherName: teachers.find(t => t.id === teacherId)?.name || 'Преподаватель не назначен',
        });
      });
    }

    onOpenChange(false);
    resetForm();
    onCreated?.(groupId);
  };

  const resetForm = () => {
    setName('');
    setLanguage('German');
    setLevel('A1');
    setCourseType('group');
    setTeacherId('');
    setPrice(8000);
    setHours(72);
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setTextbook('');
    setMaxStudents(8);
    setScheduleEntries([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="flex max-h-[94vh] max-w-6xl flex-col overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="px-6 pt-6 text-lg">Создание группы</DialogTitle>
        </DialogHeader>
        <div className="mx-6 grid w-[520px] grid-cols-3 rounded-md bg-muted p-1 text-center text-sm text-muted-foreground">
          <span className="rounded bg-background py-1.5 font-medium text-foreground shadow">Данные группы</span><span className="py-1.5">Дни занятий</span><span className="py-1.5">Занятия</span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] border-t">
        <div className="space-y-4 overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 space-y-0.5">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Дата начала *</Label>
              <Input className="h-8 text-xs" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Название группы *</Label>
              <Input className="text-xs h-8" value={name} onChange={e => setName(e.target.value)} placeholder="Deutsch A1.1" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Язык</Label>
              <Select value={language} onValueChange={v => setLanguage(v as 'German' | 'English')}>
                <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="German">Немецкий</SelectItem>
                  <SelectItem value="English">Английский</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Уровень</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Тип курса</Label>
              <Select value={courseType} onValueChange={setCourseType}>
                <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {courseTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Преподаватель</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Преподаватель не назначен</SelectItem>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Учебник</Label>
              <Input className="text-xs h-8" value={textbook} onChange={e => setTextbook(e.target.value)} placeholder="Menschen A1" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Стоимость (₽)</Label>
              <Input className="text-xs h-8" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ак. часов</Label>
              <Input className="text-xs h-8" type="number" value={hours} onChange={e => setHours(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Макс. студентов</Label>
              <Input className="text-xs h-8" type="number" value={maxStudents} onChange={e => setMaxStudents(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Расписание занятий *</Label>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addScheduleEntry}>
                + Добавить день
              </Button>
            </div>
            {scheduleEntries.length === 0 && (
              <p className="text-xs text-slate-400 py-2">Добавьте дни и время занятий</p>
            )}
            {scheduleEntries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-50">
                <Select value={String(entry.dayOfWeek ?? 1)} onValueChange={v => updateScheduleEntry(i, 'dayOfWeek', Number(v))}>
                  <SelectTrigger className="w-[100px] text-xs h-7"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayNames.map((name, d) => <SelectItem key={d} value={String(d)}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  className="text-xs h-7 w-[80px]"
                  type="time"
                  value={entry.startTime || '10:00'}
                  onChange={e => {
                    updateScheduleEntry(i, 'startTime', e.target.value);
                    updateScheduleEntry(i, 'endTime', endTimeForAcademicHours(e.target.value, entry.academicHours || 2));
                  }}
                />
                <Select value={String(entry.academicHours || 2)} onValueChange={v => {
                  updateScheduleEntry(i, 'academicHours', Number(v));
                  updateScheduleEntry(i, 'endTime', endTimeForAcademicHours(entry.startTime || '10:00', Number(v)));
                }}><SelectTrigger className="h-7 w-[92px] text-xs"><SelectValue /></SelectTrigger><SelectContent>{[2,3,4].map(v => <SelectItem key={v} value={String(v)}>{v} ак. ч.</SelectItem>)}</SelectContent></Select>
                <Select value={entry.classroom ? 'classroom' : 'zoom'} onValueChange={v => {
                  updateScheduleEntry(i, 'classroom', v === 'classroom' ? classrooms[0] : undefined);
                  updateScheduleEntry(i, 'zoomRoom', v === 'zoom' ? zoomRooms[0] : undefined);
                }}>
                  <SelectTrigger className="w-[92px] text-xs h-7"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="classroom">Аудитория</SelectItem><SelectItem value="zoom">Zoom</SelectItem></SelectContent>
                </Select>
                {entry.classroom ? <Select value={entry.classroom} onValueChange={v => updateScheduleEntry(i, 'classroom', v)}><SelectTrigger className="w-[125px] text-xs h-7"><SelectValue /></SelectTrigger><SelectContent>{classrooms.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select> : <Select value={entry.zoomRoom} onValueChange={v => updateScheduleEntry(i, 'zoomRoom', v)}><SelectTrigger className="w-[125px] text-xs h-7"><SelectValue /></SelectTrigger><SelectContent>{zoomRooms.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>}
                <span className="text-xs text-slate-400">–</span>
                <Input
                  className="text-xs h-7 w-[80px]"
                  type="time"
                  value={entry.endTime || '11:30'}
                  onChange={e => updateScheduleEntry(i, 'endTime', e.target.value)}
                />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 ml-auto" onClick={() => removeScheduleEntry(i)}>
                  ✕
                </Button>
              </div>
            ))}
          </div>

        </div>
        <CreatePreview name={name} startDate={startDate} occurrences={occurrences} hasSchedule={scheduleEntries.length > 0} />
        </div>
          <div className="flex justify-end gap-2 border-t px-6 py-3">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleCreate}>
              Создать группу
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}

function CreatePreview({ name, startDate, occurrences, hasSchedule }: { name: string; startDate: string; occurrences: ReturnType<typeof buildCourseOccurrences>; hasSchedule: boolean }) {
  const start = new Date(`${startDate}T12:00:00`);
  const first = new Date(start.getFullYear(), start.getMonth(), 1, 12);
  first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  const keys = new Set(occurrences.map(item => format(item.date, 'yyyy-MM-dd')));
  const middle = occurrences.length ? format(occurrences[Math.floor((occurrences.length - 1) / 2)].date, 'yyyy-MM-dd') : '';
  return <aside className="bg-muted/20 p-5" aria-live="polite"><div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">{['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].map(day => <b key={day}>{day}</b>)}{Array.from({ length: 42 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); const key = format(date, 'yyyy-MM-dd'); return <span key={key} className={cn('rounded py-2', date.getMonth() !== start.getMonth() && 'opacity-35', keys.has(key) && 'bg-teal-500 text-white', key === middle && 'bg-orange-400 font-bold text-white ring-2 ring-orange-200')}>{date.getDate()}</span>; })}</div><div className="mt-5 space-y-2 text-sm"><p className="font-semibold">💡 {name || 'Новая группа'}</p><p className="text-muted-foreground">Дата начала: <strong className="text-foreground">{format(start, 'dd.MM.yyyy')}</strong></p><p className="text-muted-foreground">Дата окончания: <strong className="text-foreground">{occurrences.length ? format(occurrences.at(-1)!.date, 'dd.MM.yyyy') : '—'}</strong></p><p className="text-muted-foreground">Количество занятий: <strong className="text-foreground">{occurrences.length || '—'}</strong></p>{!hasSchedule && <p className="rounded bg-amber-50 p-2 text-xs text-amber-800">Выберите дни, время и ак. часы занятия — без них группу создать нельзя.</p>}</div></aside>;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
