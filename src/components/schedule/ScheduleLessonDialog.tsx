import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDays,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, Edit3, MessageSquare, Save, Send, Trash2 } from 'lucide-react';
import { DataStore } from '../../data/store';
import { demoTeacherOptions, demoTeacherUserMap } from '../../data/demoTeachers';
import type { Group, ScheduleStatus, Student, TeacherScheduleItem } from '../../types';
import type { NormalizedComment, NormalizedTeacherScheduleItem } from '../../types/normalized';
import {
  dayNames,
  languageLabels,
  LESSON_TYPE_LABELS,
  STATUS_MAP,
} from '../../pages/teacherSchedule/constants';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface ScheduleLessonDialogProps {
  item: TeacherScheduleItem | null;
  onOpenChange: (open: boolean) => void;
  onItemUpdated?: (item: TeacherScheduleItem) => void;
}

interface LessonOccurrence {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  room?: string;
  teacherName?: string;
  imported: boolean;
}

interface RosterStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  paymentStatus: 'paid' | 'pending';
}

interface EditDraft {
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  hours: string;
  price: string;
  language: string;
  courseType: string;
  level: string;
  teacherId: string;
  textbook: string;
  format: 'online' | 'offline';
  room: string;
  studentName: string;
  packageSize: string;
  completedCount: string;
}

const GROUP_TYPES = new Set([
  'lesson', 'club', 'intensive', 'grammar', 'mini', 'phonetics', 'open_lesson', 'language_course',
]);

const WEEKDAY_TO_JS_DAY: Record<string, number> = {
  ПН: 1,
  ВТ: 2,
  СР: 3,
  ЧТ: 4,
  ПТ: 5,
  СБ: 6,
  ВС: 0,
};

const LEVEL_OPTIONS = [
  'A1', 'A1.1', 'A1.2', 'A2', 'A2.1', 'A2.2', 'B1', 'B1.1', 'B1.2',
  'B2', 'B2.1', 'B2.2', 'C1', 'C1.1', 'C2',
];

const COURSE_TYPE_OPTIONS: TeacherScheduleItem['type'][] = [
  'lesson', 'intensive', 'mini', 'grammar', 'phonetics', 'club', 'language_course', 'open_lesson',
];

const SYNTHETIC_ROSTER: Omit<RosterStudent, 'id' | 'paymentStatus'>[] = [
  { name: 'Арина Левина', phone: '+7 900 000-01-01', email: 'arina.levina@example.com' },
  { name: 'Максим Снегирёв', phone: '+7 900 000-01-02', email: 'maxim.snegirev@example.com' },
  { name: 'Полина Мартынова', phone: '+7 900 000-01-03', email: 'polina.martynova@example.com' },
  { name: 'Даниил Ветров', phone: '+7 900 000-01-04', email: 'daniil.vetrov@example.com' },
  { name: 'Елена Руденко', phone: '+7 900 000-01-05', email: 'elena.rudenko@example.com' },
  { name: 'Кирилл Беляев', phone: '+7 900 000-01-06', email: 'kirill.belyaev@example.com' },
  { name: 'Софья Ларина', phone: '+7 900 000-01-07', email: 'sofia.larina@example.com' },
  { name: 'Михаил Озеров', phone: '+7 900 000-01-08', email: 'mikhail.ozerov@example.com' },
];

function formatRoomKey(key: string | undefined): string {
  if (!key) return '—';
  if (key.startsWith('zoom')) return `Zoom ${key.replace('zoom', '') || '—'}`;
  if (key === 'online') return 'Онлайн';
  if (key === 'office') return 'Офис';
  if (key.startsWith('room')) return key.replace('room', 'Каб. ');
  return key;
}

function isGroupLesson(item: TeacherScheduleItem): boolean {
  return Boolean(item.group || item.groupId || GROUP_TYPES.has(item.type));
}

function cleanStudentName(name: string | undefined): string {
  return (name || 'Ученик')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+ЭКСБО\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedGroupName(name: string | undefined): string {
  return (name || '')
    .replace(/\|\s*[\d,.]+\s*\/\s*[\d,.]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toOccurrence(item: NormalizedTeacherScheduleItem): LessonOccurrence {
  return {
    id: item.id,
    date: item.start,
    startTime: format(item.start, 'HH:mm'),
    endTime: format(item.end, 'HH:mm'),
    status: item.status,
    room: item.classroomName || item.roomId || item.zoomRoomId,
    teacherName: item.teacherName,
    imported: true,
  };
}

function parseCourseRange(name: string, year: number): { start: Date; end: Date } | null {
  const match = name.match(/(\d{2})\.(\d{2})\s*[-–—]\s*(\d{2})\.(\d{2})/);
  if (!match) return null;
  const [, startDay, startMonth, endDay, endMonth] = match.map(Number);
  const endYear = endMonth < startMonth ? year + 1 : year;
  return {
    start: new Date(year, startMonth - 1, startDay),
    end: new Date(endYear, endMonth - 1, endDay),
  };
}

function parseCourseWeekdays(name: string): number[] {
  return Array.from(new Set((name.match(/ПН|ВТ|СР|ЧТ|ПТ|СБ|ВС/g) || []).map(day => WEEKDAY_TO_JS_DAY[day])));
}

function getCourseRange(item: TeacherScheduleItem): { start: Date; end: Date } | null {
  if (item.courseStartDate && item.courseEndDate) {
    return { start: item.courseStartDate, end: item.courseEndDate };
  }
  const parsed = parseCourseRange(item.groupName || item.group?.name || '', item.date.getFullYear());
  if (parsed) return parsed;
  if (item.group?.startDate && item.group.endDate) {
    return { start: item.group.startDate, end: item.group.endDate };
  }
  return null;
}

function getCourseWeekdays(item: TeacherScheduleItem): number[] {
  const parsed = parseCourseWeekdays(item.groupName || item.group?.name || '');
  if (parsed.length) return parsed;
  return Array.from(new Set((item.group?.schedule || []).map(schedule => schedule.dayOfWeek === 7 ? 0 : schedule.dayOfWeek)));
}

function getCourseCode(name: string): string | null {
  const matches = name.match(/(?<![.\d])\d{4}(?![.\d])/g);
  return matches?.at(-1) || null;
}

function getPackageProgress(item: TeacherScheduleItem): { completed: number; total: number } | null {
  if (item.packageSize) return { completed: item.completedCount || 0, total: item.packageSize };
  const match = item.studentName?.match(/\((\d+(?:[,.]\d+)?)\s*[/\\]\s*(\d+)\)/);
  if (!match) return null;
  return { completed: Number(match[1].replace(',', '.')), total: Number(match[2]) };
}

function getRelatedLessons(item: TeacherScheduleItem): LessonOccurrence[] {
  const allItems = DataStore.getInstance().getAllScheduleItems();
  const groupLesson = isGroupLesson(item);
  const selectedGroupName = normalizedGroupName(item.groupName || item.group?.name);
  const selectedStudentName = cleanStudentName(item.studentName).toLowerCase();

  const related = allItems.filter(candidate => {
    if (groupLesson) {
      if (item.groupId && candidate.groupId) return candidate.groupId === item.groupId;
      return Boolean(selectedGroupName) && normalizedGroupName(candidate.groupName) === selectedGroupName;
    }
    if (item.type !== 'individual') return candidate.id === item.id;
    return cleanStudentName(candidate.studentName).toLowerCase() === selectedStudentName;
  });

  const occurrences = related.map(toOccurrence);
  if (!occurrences.some(occurrence => occurrence.id === item.id)) {
    occurrences.push({
      id: item.id,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      room: item.classroom || item.zoomRoom,
      teacherName: item.teacherName || item.group?.teacher.name,
      imported: true,
    });
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function expandCourseOccurrences(item: TeacherScheduleItem, imported: LessonOccurrence[]): LessonOccurrence[] {
  if (!isGroupLesson(item)) return imported;
  const range = getCourseRange(item);
  const weekdays = getCourseWeekdays(item);
  if (!range || weekdays.length === 0) return imported;

  const importedByDate = new Map(imported.map(lesson => [format(lesson.date, 'yyyy-MM-dd'), lesson]));
  const result: LessonOccurrence[] = [];
  for (let date = range.start; date <= range.end; date = addDays(date, 1)) {
    if (!weekdays.includes(date.getDay())) continue;
    const key = format(date, 'yyyy-MM-dd');
    const actual = importedByDate.get(key);
    const wholeCourseStatus = item.status === 'cancelled' || item.status === 'recruiting' ? item.status : 'planned';
    result.push(actual || {
      id: `${item.groupId || 'course'}-${key}`,
      date,
      startTime: item.startTime,
      endTime: item.endTime,
      status: wholeCourseStatus,
      room: item.classroom || item.zoomRoom,
      teacherName: item.teacherName || item.group?.teacher.name,
      imported: false,
    });
  }
  return result;
}

function syntheticRoster(item: TeacherScheduleItem): RosterStudent[] {
  if (item.group?.students?.length) {
    return item.group.students.map((student: Student) => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      email: student.email,
      paymentStatus: student.paymentStatus === 'paid' ? 'paid' : 'pending',
    }));
  }

  const requestedSize = Math.max(0, Math.ceil(item.currentStudents || 0));
  const offset = (item.groupId || item.groupName || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: Math.min(requestedSize, SYNTHETIC_ROSTER.length) }, (_, index) => {
    const source = SYNTHETIC_ROSTER[(offset + index) % SYNTHETIC_ROSTER.length];
    return {
      ...source,
      id: `${item.groupId || 'group'}-student-${index + 1}`,
      paymentStatus: index % 5 === 4 ? 'pending' : 'paid',
    };
  });
}

function calculateCourseHours(occurrences: LessonOccurrence[]): number {
  const minutes = occurrences.reduce((sum, lesson) => {
    const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
    const [endHour, endMinute] = lesson.endTime.split(':').map(Number);
    return sum + Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
  }, 0);
  return Math.round((minutes / 45) * 10) / 10;
}

function DetailRow({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 py-1.5 text-sm">
      <dt className="text-right font-medium text-muted-foreground">{label}</dt>
      <dd className={accent ? 'font-semibold text-sky-600' : 'text-foreground'}>{value || '—'}</dd>
    </div>
  );
}

function CalendarLegend({ editPalette }: { editPalette: boolean }) {
  return (
    <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-teal-500" />Занятие</span>
      {editPalette ? (
        <>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-sky-300" />Выходной</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-orange-400" />Середина курса</span>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-yellow-300" />Последнее</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm border border-red-300 bg-red-50" />Отмена / перенос</span>
        </>
      )}
    </div>
  );
}

function CourseCalendar({ occurrences, selectedDate, editPalette = false }: { occurrences: LessonOccurrence[]; selectedDate: Date; editPalette?: boolean }) {
  if (occurrences.length === 0) return null;
  const firstDate = occurrences[0].date;
  const lastDate = occurrences[occurrences.length - 1].date;
  const months = eachMonthOfInterval({ start: startOfMonth(firstDate), end: startOfMonth(lastDate) }).slice(0, 8);
  const occurrencesByDate = new Map(occurrences.map(lesson => [format(lesson.date, 'yyyy-MM-dd'), lesson]));
  const midpoint = occurrences[Math.floor((occurrences.length - 1) / 2)]?.date;

  return (
    <div className={editPalette ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2' : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'}>
      {months.map(month => {
        const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
        const days: Date[] = [];
        for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) days.push(day);

        return (
          <div key={month.toISOString()} className="rounded-xl border border-border/70 p-3">
            <p className="mb-3 text-center text-sm font-semibold capitalize">{format(month, 'LLLL yyyy', { locale: ru })}</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map(day => <span key={day} className="pb-1 text-[10px] font-semibold text-muted-foreground">{day}</span>)}
              {days.map(day => {
                const outsideMonth = day.getMonth() !== month.getMonth();
                const lesson = occurrencesByDate.get(format(day, 'yyyy-MM-dd'));
                const selected = isSameDay(day, selectedDate);
                const weekend = day.getDay() === 0 || day.getDay() === 6;
                const isMidpoint = Boolean(midpoint && isSameDay(day, midpoint));
                let dayClass = 'border-transparent text-foreground';

                if (editPalette) {
                  if (weekend) dayClass = 'border-sky-300 bg-sky-300 text-white';
                  if (lesson) dayClass = 'border-teal-500 bg-teal-500 text-white';
                  if (isMidpoint) dayClass = 'border-orange-400 bg-orange-400 text-white';
                } else if (lesson?.status === 'cancelled') {
                  dayClass = 'border-red-300 bg-red-50 text-red-600 line-through';
                } else if (lesson?.status === 'recruiting') {
                  dayClass = 'border-red-300 bg-white text-red-600';
                } else if (lesson?.status === 'last_lesson') {
                  dayClass = 'border-yellow-300 bg-yellow-300 text-yellow-950';
                } else if (lesson) {
                  dayClass = 'border-teal-500 bg-teal-500 text-white';
                }

                return (
                  <div
                    key={day.toISOString()}
                    title={lesson ? `${lesson.startTime}–${lesson.endTime}` : undefined}
                    className={`flex aspect-square items-center justify-center rounded-md border text-[11px] ${outsideMonth ? 'invisible' : dayClass} ${!editPalette && selected ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function dateFromInput(value: string, fallback: Date): Date {
  if (!value) return fallback;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dateWithTime(date: Date, time: string): Date {
  const next = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
}

function createEditDraft(item: TeacherScheduleItem, occurrences: LessonOccurrence[]): EditDraft {
  const range = getCourseRange(item);
  const packageProgress = getPackageProgress(item);
  return {
    name: item.groupName || item.group?.name || cleanStudentName(item.studentName),
    startDate: format(range?.start || item.date, 'yyyy-MM-dd'),
    endDate: format(range?.end || item.date, 'yyyy-MM-dd'),
    startTime: item.startTime,
    endTime: item.endTime,
    hours: String(item.courseHours ?? calculateCourseHours(occurrences)),
    price: String(item.coursePrice ?? item.group?.price ?? 0),
    language: item.groupLanguage || item.group?.language || 'German',
    courseType: item.courseType || item.type,
    level: item.groupLevel || item.group?.level || 'A1',
    teacherId: item.teacherId || item.group?.teacher.id || demoTeacherOptions[0].id,
    textbook: item.textbook || '',
    format: item.format || 'offline',
    room: item.classroom || item.zoomRoom || '',
    studentName: cleanStudentName(item.studentName),
    packageSize: String(packageProgress?.total || 1),
    completedCount: String(packageProgress?.completed || 0),
  };
}

function applyDraftToItem(item: TeacherScheduleItem, draft: EditDraft): TeacherScheduleItem {
  const groupLesson = isGroupLesson(item);
  const teacher = demoTeacherOptions.find(option => option.id === draft.teacherId);
  const lessonDate = groupLesson ? item.date : dateFromInput(draft.startDate, item.date);
  const type = groupLesson && COURSE_TYPE_OPTIONS.includes(draft.courseType as TeacherScheduleItem['type'])
    ? draft.courseType as TeacherScheduleItem['type']
    : item.type;
  const nextGroup = item.group ? {
    ...item.group,
    name: draft.name,
    language: draft.language as Group['language'],
    level: draft.level as Group['level'],
    teacher: { ...item.group.teacher, id: draft.teacherId, name: teacher?.name || item.group.teacher.name },
    startDate: dateFromInput(draft.startDate, item.group.startDate),
    endDate: dateFromInput(draft.endDate, item.group.endDate || item.date),
    price: Number(draft.price) || 0,
  } : undefined;

  return {
    ...item,
    date: lessonDate,
    startTime: draft.startTime,
    endTime: draft.endTime,
    type,
    teacherId: draft.teacherId,
    teacherName: teacher?.name || item.teacherName,
    groupName: groupLesson ? draft.name : item.groupName,
    groupLanguage: draft.language,
    groupLevel: draft.level,
    courseType: draft.courseType,
    format: draft.format,
    classroom: draft.format === 'offline' ? draft.room || undefined : undefined,
    zoomRoom: draft.format === 'online' ? draft.room || undefined : undefined,
    studentName: groupLesson ? item.studentName : draft.studentName,
    packageSize: groupLesson ? item.packageSize : Math.max(1, Number(draft.packageSize) || 1),
    completedCount: groupLesson ? item.completedCount : Math.max(0, Number(draft.completedCount) || 0),
    courseStartDate: dateFromInput(draft.startDate, item.date),
    courseEndDate: dateFromInput(draft.endDate, item.date),
    courseHours: Math.max(0, Number(draft.hours) || 0),
    coursePrice: Math.max(0, Number(draft.price) || 0),
    textbook: draft.textbook.trim() || undefined,
    group: nextGroup,
  };
}

function FormRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-dashed border-border/70 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function authorName(authorId: string): string {
  if (authorId === 'admin') return 'Ольга Громова';
  return demoTeacherUserMap[authorId]?.name || 'Администратор';
}

function initials(value: string): string {
  return value.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function ScheduleLessonDialog({ item, onOpenChange, onItemUpdated }: ScheduleLessonDialogProps) {
  const store = DataStore.getInstance();
  const [activeItem, setActiveItem] = useState<TeacherScheduleItem | null>(item);
  const [screen, setScreen] = useState<'view' | 'edit'>('view');
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [comments, setComments] = useState<NormalizedComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  useEffect(() => {
    setActiveItem(item);
    setScreen('view');
    setDraft(null);
    setCommentText('');
    setSelectedCommentId(null);
  }, [item]);

  const groupLesson = activeItem ? isGroupLesson(activeItem) : false;
  const commentEntityType: NormalizedComment['entityType'] = groupLesson ? 'group' : 'lesson';
  const commentEntityId = activeItem ? (groupLesson ? activeItem.groupId || activeItem.id : activeItem.id) : '';

  const reloadComments = useCallback(() => {
    if (!commentEntityId) return;
    setComments(
      store.getEntityComments(commentEntityType, commentEntityId)
        .filter(comment => !comment.deletedAt)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
    );
  }, [commentEntityId, commentEntityType, store]);

  useEffect(() => {
    reloadComments();
  }, [reloadComments]);

  const importedOccurrences = useMemo(() => activeItem ? getRelatedLessons(activeItem) : [], [activeItem]);
  const occurrences = useMemo(() => activeItem ? expandCourseOccurrences(activeItem, importedOccurrences) : [], [activeItem, importedOccurrences]);
  const roster = useMemo(() => activeItem ? syntheticRoster(activeItem) : [], [activeItem]);
  const previewItem = useMemo(() => activeItem && draft ? applyDraftToItem(activeItem, draft) : activeItem, [activeItem, draft]);
  const previewOccurrences = useMemo(() => previewItem ? expandCourseOccurrences(previewItem, getRelatedLessons(previewItem)) : [], [previewItem]);

  if (!activeItem) return null;

  const groupName = activeItem.groupName || activeItem.group?.name || '';
  const studentName = cleanStudentName(activeItem.studentName);
  const title = groupLesson ? groupName || 'Групповое занятие' : studentName;
  const teacherName = activeItem.teacherName || activeItem.group?.teacher.name || (activeItem.teacherId ? demoTeacherUserMap[activeItem.teacherId]?.name : undefined);
  const language = activeItem.groupLanguage || activeItem.group?.language;
  const level = activeItem.groupLevel || activeItem.group?.level;
  const room = activeItem.classroom || activeItem.zoomRoom;
  const status = STATUS_MAP[activeItem.status as ScheduleStatus] || STATUS_MAP.unavailable;
  const range = getCourseRange(activeItem);
  const courseWeekdays = getCourseWeekdays(activeItem);
  const courseCode = getCourseCode(groupName);
  const packageProgress = getPackageProgress(activeItem);
  const currentStudents = activeItem.currentStudents ?? activeItem.group?.students?.length ?? 0;
  const capacity = activeItem.capacity ?? activeItem.group?.maxStudents ?? 0;
  const scheduleDays = courseWeekdays.length
    ? courseWeekdays.map(day => dayNames[(day + 6) % 7]).join(', ')
    : Array.from(new Set(importedOccurrences.map(lesson => dayNames[(lesson.date.getDay() + 6) % 7]))).join(', ');
  const courseHours = activeItem.courseHours ?? calculateCourseHours(occurrences);
  const coursePrice = activeItem.coursePrice ?? activeItem.group?.price;

  const handleSelectComment = (comment: NormalizedComment) => {
    setSelectedCommentId(comment.id);
    setCommentText(comment.text);
  };

  const handleSaveComment = () => {
    const text = commentText.trim();
    if (!text) return;
    if (selectedCommentId) store.updateComment(selectedCommentId, { text });
    else {
      store.addComment({
        id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        entityType: commentEntityType,
        entityId: commentEntityId,
        authorId: 'admin',
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setCommentText('');
    setSelectedCommentId(null);
    reloadComments();
  };

  const handleDeleteComment = () => {
    if (!selectedCommentId) return;
    store.softDeleteComment(selectedCommentId);
    setCommentText('');
    setSelectedCommentId(null);
    reloadComments();
  };

  const handleStartEdit = () => {
    setDraft(createEditDraft(activeItem, occurrences));
    setScreen('edit');
  };

  const handleSaveEdit = () => {
    if (!draft) return;
    const updated = applyDraftToItem(activeItem, draft);
    const allStoreItems = store.getAllScheduleItems();
    const relatedStoreItems = groupLesson
      ? allStoreItems.filter(candidate => activeItem.groupId
        ? candidate.groupId === activeItem.groupId
        : normalizedGroupName(candidate.groupName) === normalizedGroupName(groupName))
      : allStoreItems.filter(candidate => candidate.id === activeItem.id);

    const normalizedUpdate: Partial<NormalizedTeacherScheduleItem> = {
      teacherId: updated.teacherId || activeItem.teacherId || '',
      teacherName: updated.teacherName,
      groupName: updated.groupName,
      groupLanguage: updated.groupLanguage,
      groupLevel: updated.groupLevel,
      courseType: updated.courseType,
      lessonType: updated.type,
      format: updated.format,
      classroomName: updated.classroom || updated.zoomRoom,
      roomId: updated.format === 'offline' ? updated.classroom : undefined,
      zoomRoomId: updated.format === 'online' ? updated.zoomRoom : undefined,
      studentName: updated.studentName,
      packageSize: updated.packageSize,
      completedCount: updated.completedCount,
      courseStartDate: updated.courseStartDate,
      courseEndDate: updated.courseEndDate,
      courseHours: updated.courseHours,
      coursePrice: updated.coursePrice,
      textbook: updated.textbook,
    };

    relatedStoreItems.forEach(candidate => {
      const occurrenceDate = groupLesson ? candidate.start : updated.date;
      store.updateScheduleItem(candidate.id, {
        ...normalizedUpdate,
        start: dateWithTime(occurrenceDate, updated.startTime),
        end: dateWithTime(occurrenceDate, updated.endTime),
      });
    });

    setActiveItem(updated);
    onItemUpdated?.(updated);
    setScreen('view');
  };

  const updateDraft = <K extends keyof EditDraft>(key: K, value: EditDraft[K]) => {
    setDraft(current => current ? { ...current, [key]: value } : current);
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border/70 bg-muted/20 px-6 py-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-lg leading-snug md:text-xl">{screen === 'edit' ? (groupLesson ? 'Редактирование группы' : 'Редактирование занятия') : title}</DialogTitle>
              <DialogDescription className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LESSON_TYPE_LABELS[activeItem.type] || 'Занятие'}</Badge>
                {level && <Badge variant="outline">{level}</Badge>}
                <Badge variant="outline" style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}>{status.label}</Badge>
              </DialogDescription>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-right">
              <p className="text-xs text-muted-foreground">Выбранное занятие</p>
              <p className="text-sm font-semibold">{format(activeItem.date, 'd MMMM yyyy', { locale: ru })}</p>
              <p className="text-xs text-muted-foreground">{activeItem.startTime}–{activeItem.endTime}</p>
            </div>
          </div>
        </DialogHeader>

        {screen === 'edit' && draft ? (
          <div className="px-6 py-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setScreen('view')}><ArrowLeft className="mr-2 h-4 w-4" />К карточке</Button>
              <div className="flex gap-2"><Button variant="outline" onClick={() => setScreen('view')}>Отменить</Button><Button onClick={handleSaveEdit}><Save className="mr-2 h-4 w-4" />Сохранить</Button></div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
              <section className="min-w-0 rounded-xl border border-border/70 bg-background px-5">
                {groupLesson && <FormRow label="Номер группы"><Input value={courseCode || activeItem.groupId || '—'} disabled className="bg-muted" /></FormRow>}
                <FormRow label={groupLesson ? 'Дата начала' : 'Дата занятия'} htmlFor="course-start-date"><Input id="course-start-date" type="date" value={draft.startDate} onChange={event => updateDraft('startDate', event.target.value)} /></FormRow>
                {groupLesson && <FormRow label="Дата окончания" htmlFor="course-end-date"><Input id="course-end-date" type="date" value={draft.endDate} onChange={event => updateDraft('endDate', event.target.value)} /></FormRow>}
                <FormRow label="Время"><div className="grid grid-cols-2 gap-2"><Input type="time" value={draft.startTime} onChange={event => updateDraft('startTime', event.target.value)} /><Input type="time" value={draft.endTime} onChange={event => updateDraft('endTime', event.target.value)} /></div></FormRow>
                {groupLesson && <><FormRow label="Объём курса" htmlFor="course-hours"><Input id="course-hours" type="number" min="0" step="0.5" value={draft.hours} onChange={event => updateDraft('hours', event.target.value)} /></FormRow><FormRow label="Стоимость" htmlFor="course-price"><Input id="course-price" type="number" min="0" step="100" value={draft.price} onChange={event => updateDraft('price', event.target.value)} /></FormRow></>}
                <FormRow label="Язык"><Select value={draft.language} onValueChange={value => updateDraft('language', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="German">Немецкий</SelectItem><SelectItem value="English">Английский</SelectItem></SelectContent></Select></FormRow>
                {groupLesson && <FormRow label="Тип курса"><Select value={draft.courseType} onValueChange={value => updateDraft('courseType', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COURSE_TYPE_OPTIONS.map(type => <SelectItem key={type} value={type}>{LESSON_TYPE_LABELS[type]}</SelectItem>)}</SelectContent></Select></FormRow>}
                <FormRow label="Уровень"><Select value={draft.level} onValueChange={value => updateDraft('level', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LEVEL_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></FormRow>
                <FormRow label="Учитель"><Select value={draft.teacherId} onValueChange={value => updateDraft('teacherId', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{demoTeacherOptions.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}</SelectContent></Select></FormRow>
                <FormRow label="Формат"><Select value={draft.format} onValueChange={value => updateDraft('format', value as EditDraft['format'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="offline">Очно</SelectItem><SelectItem value="online">Онлайн</SelectItem></SelectContent></Select></FormRow>
                <FormRow label={draft.format === 'online' ? 'Zoom' : 'Аудитория'} htmlFor="course-room"><Input id="course-room" value={draft.room} onChange={event => updateDraft('room', event.target.value)} placeholder={draft.format === 'online' ? 'Zoom 1' : 'Кабинет 3'} /></FormRow>
                {groupLesson ? <><FormRow label="Учебник" htmlFor="course-textbook"><Input id="course-textbook" value={draft.textbook} onChange={event => updateDraft('textbook', event.target.value)} placeholder="Например, Schritte International Neu 3" /></FormRow><FormRow label="Наименование" htmlFor="course-name"><Input id="course-name" value={draft.name} onChange={event => updateDraft('name', event.target.value)} /></FormRow></> : <><FormRow label="Ученик" htmlFor="lesson-student"><Input id="lesson-student" value={draft.studentName} onChange={event => updateDraft('studentName', event.target.value)} /></FormRow><FormRow label="Размер пакета" htmlFor="lesson-package-size"><Input id="lesson-package-size" type="number" min="1" value={draft.packageSize} onChange={event => updateDraft('packageSize', event.target.value)} /></FormRow><FormRow label="Проведено" htmlFor="lesson-completed-count"><Input id="lesson-completed-count" type="number" min="0" value={draft.completedCount} onChange={event => updateDraft('completedCount', event.target.value)} /></FormRow></>}
              </section>

              <aside className="min-w-0 xl:sticky xl:top-0 xl:self-start">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="mb-4"><h3 className="text-sm font-semibold">Календарь курса</h3><p className="mt-1 text-xs text-muted-foreground">Только отображение — даты меняются через поля формы.</p></div>
                  <CourseCalendar occurrences={previewOccurrences} selectedDate={activeItem.date} editPalette />
                  <div className="mt-4"><CalendarLegend editPalette /></div>
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">Пока оранжевая дата — среднее занятие в списке. Точную бизнес-логику середины курса подключим отдельно.</p>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="space-y-8 px-6 py-6">
            <div><Button size="sm" onClick={handleStartEdit}><Edit3 className="mr-2 h-4 w-4" />Редактировать</Button></div>

            <section className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.15fr)]">
              <div className="min-w-0">
                <h3 className="mb-3 text-sm font-semibold">Данные {groupLesson ? 'группы' : 'занятия'}</h3>
                <dl className="rounded-xl border border-border/70 bg-background px-4 py-3">
                  {groupLesson && <DetailRow label="Номер группы" value={courseCode || activeItem.groupId || '—'} />}
                  <DetailRow label="Язык" value={language ? languageLabels[language] || language : '—'} />
                  <DetailRow label="Уровень" value={level || '—'} />
                  <DetailRow label={groupLesson ? 'Тип курса' : 'Тип занятия'} value={LESSON_TYPE_LABELS[activeItem.type] || activeItem.courseType || '—'} />
                  {groupLesson && <DetailRow label="Объём курса" value={courseHours ? `${courseHours} ак. ч.` : '—'} />}
                  {groupLesson && <DetailRow label="Стоимость" value={coursePrice !== undefined ? `${coursePrice.toLocaleString('ru-RU')} ₽` : '—'} />}
                  <DetailRow label="Учитель" value={teacherName || '—'} />
                  {groupLesson && <DetailRow label="Учебник" value={activeItem.textbook || '—'} />}
                  {range && <DetailRow label="Дата начала" value={format(range.start, 'dd.MM.yyyy')} />}
                  {range && <DetailRow label="Дата окончания" value={format(range.end, 'dd.MM.yyyy')} />}
                  <DetailRow label="Дни занятий" value={scheduleDays || dayNames[(activeItem.date.getDay() + 6) % 7]} />
                  <DetailRow label="Время" value={`${activeItem.startTime}–${activeItem.endTime}`} accent />
                  <DetailRow label="Формат" value={activeItem.format === 'online' ? 'Онлайн' : 'Очно'} />
                  <DetailRow label="Место" value={formatRoomKey(room)} />
                  {groupLesson && <DetailRow label="Наполняемость" value={capacity ? `${currentStudents} из ${capacity}` : currentStudents} />}
                  {!groupLesson && <DetailRow label="Ученик" value={studentName} />}
                  {!groupLesson && packageProgress && <DetailRow label="Пакет" value={`${packageProgress.completed} из ${packageProgress.total}`} />}
                </dl>
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" />Лента комментариев</h3><span className="text-xs text-muted-foreground">{comments.length}</span></div>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
                  <div className="h-[300px] overflow-y-auto">
                    {comments.length ? comments.map(comment => {
                      const name = authorName(comment.authorId);
                      const selected = selectedCommentId === comment.id;
                      return (
                        <button key={comment.id} type="button" onClick={() => handleSelectComment(comment)} className={`flex w-full gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50 ${selected ? 'bg-teal-50 ring-1 ring-inset ring-teal-200' : ''}`}>
                          <Avatar className="mt-0.5 h-8 w-8 shrink-0"><AvatarFallback className="bg-teal-100 text-[10px] font-semibold text-teal-800">{initials(name)}</AvatarFallback></Avatar>
                          <span className="min-w-0 flex-1"><span className="block whitespace-pre-wrap text-sm leading-relaxed text-foreground">{comment.text}</span><span className="mt-1 block text-[11px] text-muted-foreground">{name} · {format(comment.updatedAt, 'dd.MM.yyyy, HH:mm')}</span></span>
                        </button>
                      );
                    }) : <div className="flex h-full flex-col items-center justify-center px-6 text-center"><MessageSquare className="mb-2 h-7 w-7 text-muted-foreground/50" /><p className="text-sm font-medium">Комментариев пока нет</p><p className="mt-1 text-xs text-muted-foreground">Первый комментарий можно добавить ниже.</p></div>}
                  </div>
                  <div className="border-t border-border/70 bg-muted/20 p-3">
                    {selectedCommentId && <p className="mb-2 text-xs font-medium text-teal-700">Редактирование выбранного комментария</p>}
                    <Textarea value={commentText} onChange={event => setCommentText(event.target.value)} placeholder="Добавить комментарий для администраторов…" className="min-h-[88px] resize-y bg-background" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div>{selectedCommentId && <Button variant="destructive" size="sm" onClick={handleDeleteComment}><Trash2 className="mr-2 h-4 w-4" />Удалить</Button>}</div>
                      <div className="flex gap-2">{selectedCommentId && <Button variant="ghost" size="sm" onClick={() => { setSelectedCommentId(null); setCommentText(''); }}>Отменить</Button>}<Button size="sm" onClick={handleSaveComment} disabled={!commentText.trim()}>{selectedCommentId ? <Save className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}{selectedCommentId ? 'Сохранить' : 'Отправить'}</Button></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {!groupLesson && packageProgress && <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><div className="flex items-center justify-between gap-4"><div><h3 className="text-sm font-semibold text-emerald-950">Пакет индивидуальных занятий</h3><p className="mt-0.5 text-xs text-emerald-800">Проведено {packageProgress.completed} из {packageProgress.total}</p></div><span className="text-lg font-semibold text-emerald-900">{Math.round((packageProgress.completed / packageProgress.total) * 100)}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (packageProgress.completed / packageProgress.total) * 100)}%` }} /></div></section>}

            {groupLesson && (
              <section>
                <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="text-sm font-semibold">Студенты группы</h3><p className="mt-0.5 text-xs text-muted-foreground">Демонстрационные анонимизированные данные</p></div><Badge variant="secondary">{currentStudents}{capacity ? ` / ${capacity}` : ''}</Badge></div>
                {roster.length ? <div className="overflow-hidden rounded-xl border border-border/70"><div className="hidden grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_minmax(190px,1.2fr)_auto] gap-3 bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:grid"><span>ФИО</span><span>Телефон</span><span>Email</span><span>Статус</span></div>{roster.map(student => <div key={student.id} className="grid gap-1 border-t border-border/60 px-4 py-3 first:border-t-0 md:grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_minmax(190px,1.2fr)_auto] md:items-center md:gap-3"><span className="text-sm font-medium">{student.name}</span><span className="text-xs text-muted-foreground">{student.phone}</span><span className="truncate text-xs text-muted-foreground">{student.email}</span><div className="flex gap-1.5"><Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Учится</Badge><Badge className={student.paymentStatus === 'paid' ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}>{student.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}</Badge></div></div>)}</div> : <div className="rounded-xl border border-dashed border-red-200 bg-red-50/40 px-4 py-8 text-center text-sm text-red-700">Студентов пока нет — группа находится в наборе или перенесена.</div>}
              </section>
            )}

            {!groupLesson && activeItem.type === 'individual' && <section><h3 className="mb-3 text-sm font-semibold">Все найденные занятия пакета</h3><div className="overflow-hidden rounded-xl border border-border/70">{importedOccurrences.map((lesson, index) => <div key={lesson.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">{index + 1}</span><div><p className="text-sm font-medium">{format(lesson.date, 'EEEE, d MMMM', { locale: ru })}</p><p className="text-xs text-muted-foreground">{lesson.startTime}–{lesson.endTime} · {formatRoomKey(lesson.room)}</p></div><Badge variant="outline">{isSameDay(lesson.date, activeItem.date) ? 'Выбрано' : 'В расписании'}</Badge></div>)}</div></section>}

            <section><div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-sm font-semibold">{groupLesson ? 'Календарь курса' : 'Календарь занятий'}</h3><p className="mt-0.5 text-xs text-muted-foreground">{groupLesson ? `${occurrences.length} занятий по заявленному расписанию` : `${occurrences.length} занятий найдено в загруженном расписании`}</p></div><CalendarLegend editPalette={false} /></div><CourseCalendar occurrences={occurrences} selectedDate={activeItem.date} /></section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
