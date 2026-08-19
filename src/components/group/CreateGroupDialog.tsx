import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataStore } from '../../data/store';
import { realGroups } from '../../data/realGroups';
import { demoTeacherOptions } from '../../data/demoTeachers';
import type { ScheduleItem } from '../../types';
import { NormalizedGroup, NormalizedScheduleEntry } from '../../types/normalized';

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

  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'German' | 'English'>('German');
  const [level, setLevel] = useState('A1');
  const [courseType, setCourseType] = useState('group');
  const [teacherId, setTeacherId] = useState('');
  const [price, setPrice] = useState(8000);
  const [hours, setHours] = useState(72);
  const [textbook, setTextbook] = useState('');
  const [maxStudents, setMaxStudents] = useState(8);
  const [scheduleEntries, setScheduleEntries] = useState<Partial<NormalizedScheduleEntry>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const addScheduleEntry = () => {
    setScheduleEntries(prev => [...prev, { dayOfWeek: 1, startTime: '10:00', endTime: '11:30' }]);
  };

  const updateScheduleEntry = (index: number, field: keyof NormalizedScheduleEntry, value: unknown) => {
    setScheduleEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const removeScheduleEntry = (index: number) => {
    setScheduleEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Название группы обязательно');
    if (!teacherId) errs.push('Выберите преподавателя');
    if (price <= 0) errs.push('Укажите стоимость');
    if (hours <= 0) errs.push('Укажите количество часов');
    if (scheduleEntries.length === 0) errs.push('Добавьте хотя бы один день занятий');
    setErrors(errs);
    if (errs.length > 0) return;

    const groupNum = store.getNextGroupNumber();
    const code = `26-${groupNum}`;
    const now = new Date();
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
      teacherId,
      teacherName: demoTeacherOptions.find(t => t.id === teacherId)?.name || '',
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
      startDate: now,
      endDate: undefined,
      createdAt: now,
      updatedAt: now,
    };

    store.addGroup(group);

    // Also add to realGroups for GroupInfoDialog compatibility
    const realSchedule: ScheduleItem[] = scheduleEntries.map(s => ({
      dayOfWeek: s.dayOfWeek ?? 1,
      startTime: s.startTime || '10:00',
      endTime: s.endTime || '11:30',
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
      teacherId,
      teacherName: demoTeacherOptions.find(t => t.id === teacherId)?.name || '',
      textbook,
      startDate: now,
      endDate: new Date(now.getFullYear() + 1, 0, 1),
      schedule: realSchedule,
      studentIds: [],
      maxStudents,
      status: 'planned',
    });

    if (scheduleEntries.some(s => s.startTime && s.endTime)) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((scheduleEntries[0].dayOfWeek ?? 1) - now.getDay() + 7) % 7);
      startDate.setHours(8, 0, 0, 0);

      schedule.forEach(s => {
        const [sh, sm] = (s.startTime || '10:00').split(':').map(Number);
        const [eh, em] = (s.endTime || '11:30').split(':').map(Number);
        const start = new Date(startDate);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(startDate);
        end.setHours(eh, em, 0, 0);

        store.addScheduleItem({
          id: `real_si_${groupId}_${formatDate(start)}_${s.startTime?.replace(':', '') || ''}`,
          teacherId,
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
          format: 'offline',
          teacherName: demoTeacherOptions.find(t => t.id === teacherId)?.name || '',
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
    setTextbook('');
    setMaxStudents(8);
    setScheduleEntries([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Создать группу</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700 space-y-0.5">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
              <Label className="text-xs">Преподаватель *</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                <SelectContent>
                  {demoTeacherOptions.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
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
                  onChange={e => updateScheduleEntry(i, 'startTime', e.target.value)}
                />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleCreate}>
              Создать группу
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
