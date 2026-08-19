import { useMemo } from 'react';
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
import {
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Monitor,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { DataStore } from '../../data/store';
import { demoTeacherUserMap } from '../../data/demoTeachers';
import type { ScheduleStatus, Student, TeacherScheduleItem } from '../../types';
import type { NormalizedTeacherScheduleItem } from '../../types/normalized';
import {
  dayNames,
  languageLabels,
  LESSON_TYPE_LABELS,
  STATUS_MAP,
} from '../../pages/teacherSchedule/constants';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface ScheduleLessonDialogProps {
  item: TeacherScheduleItem | null;
  onOpenChange: (open: boolean) => void;
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
  if (item.packageSize) {
    return { completed: item.completedCount || 0, total: item.packageSize };
  }
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5 min-w-0">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-foreground break-words">{value || '—'}</div>
      </div>
    </div>
  );
}

function CourseCalendar({ occurrences, selectedDate }: { occurrences: LessonOccurrence[]; selectedDate: Date }) {
  if (occurrences.length === 0) return null;
  const firstDate = occurrences[0].date;
  const lastDate = occurrences[occurrences.length - 1].date;
  const months = eachMonthOfInterval({ start: startOfMonth(firstDate), end: startOfMonth(lastDate) }).slice(0, 8);
  const occurrencesByDate = new Map(occurrences.map(lesson => [format(lesson.date, 'yyyy-MM-dd'), lesson]));

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {months.map(month => {
        const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
        const days: Date[] = [];
        for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) days.push(day);

        return (
          <div key={month.toISOString()} className="rounded-xl border border-border/70 p-3">
            <p className="mb-3 text-center text-sm font-semibold capitalize">
              {format(month, 'LLLL yyyy', { locale: ru })}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map(day => (
                <span key={day} className="pb-1 text-[10px] font-semibold text-muted-foreground">{day}</span>
              ))}
              {days.map(day => {
                const outsideMonth = day.getMonth() !== month.getMonth();
                const lesson = occurrencesByDate.get(format(day, 'yyyy-MM-dd'));
                const selected = isSameDay(day, selectedDate);
                const cancelled = lesson?.status === 'cancelled';
                const recruiting = lesson?.status === 'recruiting';
                const lastLesson = lesson?.status === 'last_lesson';
                const lessonClass = cancelled
                  ? 'border-red-300 bg-red-50 text-red-600 line-through'
                  : recruiting
                    ? 'border-red-300 bg-white text-red-600'
                    : lastLesson
                      ? 'border-yellow-300 bg-yellow-300 text-yellow-950'
                      : lesson
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-transparent text-foreground';
                return (
                  <div
                    key={day.toISOString()}
                    title={lesson ? `${lesson.startTime}–${lesson.endTime}` : undefined}
                    className={`flex aspect-square items-center justify-center rounded-md border text-[11px] ${outsideMonth ? 'invisible' : lessonClass} ${selected ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
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

export default function ScheduleLessonDialog({ item, onOpenChange }: ScheduleLessonDialogProps) {
  const importedOccurrences = useMemo(() => item ? getRelatedLessons(item) : [], [item]);
  const occurrences = useMemo(
    () => item ? expandCourseOccurrences(item, importedOccurrences) : [],
    [item, importedOccurrences],
  );
  const roster = useMemo(() => item ? syntheticRoster(item) : [], [item]);

  if (!item) return null;

  const groupLesson = isGroupLesson(item);
  const groupName = item.groupName || item.group?.name || '';
  const studentName = cleanStudentName(item.studentName);
  const title = groupLesson ? groupName || 'Групповое занятие' : studentName;
  const teacherName = item.teacherName || item.group?.teacher.name || (item.teacherId ? demoTeacherUserMap[item.teacherId]?.name : undefined);
  const language = item.groupLanguage || item.group?.language;
  const level = item.groupLevel || item.group?.level;
  const room = item.classroom || item.zoomRoom;
  const status = STATUS_MAP[item.status as ScheduleStatus] || STATUS_MAP.unavailable;
  const range = getCourseRange(item);
  const courseWeekdays = getCourseWeekdays(item);
  const courseCode = getCourseCode(groupName);
  const packageProgress = getPackageProgress(item);
  const currentStudents = item.currentStudents ?? item.group?.students?.length ?? 0;
  const capacity = item.capacity ?? item.group?.maxStudents ?? 0;
  const scheduleDays = courseWeekdays.length
    ? courseWeekdays.map(day => dayNames[(day + 6) % 7]).join(', ')
    : Array.from(new Set(importedOccurrences.map(lesson => dayNames[(lesson.date.getDay() + 6) % 7]))).join(', ');

  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border/70 bg-muted/25 px-6 py-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="text-lg leading-snug md:text-xl">{title}</DialogTitle>
              <DialogDescription className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{LESSON_TYPE_LABELS[item.type] || 'Занятие'}</Badge>
                {level && <Badge variant="outline">{level}</Badge>}
                <Badge
                  variant="outline"
                  style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}
                >
                  {status.label}
                </Badge>
              </DialogDescription>
            </div>
            <div className="rounded-lg border border-border bg-background px-3 py-2 text-right">
              <p className="text-xs text-muted-foreground">Выбранное занятие</p>
              <p className="text-sm font-semibold">{format(item.date, 'd MMMM yyyy', { locale: ru })}</p>
              <p className="text-xs text-muted-foreground">{item.startTime}–{item.endTime}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 px-6 py-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold">Информация</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem icon={<UserRound className="h-4 w-4" />} label="Преподаватель" value={teacherName} />
              <InfoItem icon={<Clock3 className="h-4 w-4" />} label="Время" value={`${item.startTime}–${item.endTime}`} />
              <InfoItem icon={item.format === 'online' ? <Monitor className="h-4 w-4" /> : <MapPin className="h-4 w-4" />} label="Формат и место" value={`${item.format === 'online' ? 'Онлайн' : 'Очно'} · ${formatRoomKey(room)}`} />
              <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="Язык и уровень" value={[language ? languageLabels[language] || language : null, level].filter(Boolean).join(' · ') || '—'} />
              <InfoItem icon={<BookOpen className="h-4 w-4" />} label={groupLesson ? 'Курс' : 'Ученик'} value={groupLesson ? `${LESSON_TYPE_LABELS[item.type] || 'Группа'}${courseCode ? ` · № ${courseCode}` : ''}` : studentName} />
              <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Дни занятий" value={scheduleDays || dayNames[(item.date.getDay() + 6) % 7]} />
              {range && <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Период курса" value={`${format(range.start, 'dd.MM.yyyy')}–${format(range.end, 'dd.MM.yyyy')}`} />}
              {groupLesson && <InfoItem icon={<UsersRound className="h-4 w-4" />} label="Наполняемость" value={capacity ? `${currentStudents} из ${capacity}` : `${currentStudents}`} />}
              {!groupLesson && packageProgress && <InfoItem icon={<WalletCards className="h-4 w-4" />} label="Пакет занятий" value={`${packageProgress.completed} из ${packageProgress.total}`} />}
            </div>
          </section>

          {!groupLesson && packageProgress && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-950">Пакет индивидуальных занятий</h3>
                  <p className="mt-0.5 text-xs text-emerald-800">Проведено {packageProgress.completed} из {packageProgress.total}</p>
                </div>
                <span className="text-lg font-semibold text-emerald-900">{Math.round((packageProgress.completed / packageProgress.total) * 100)}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (packageProgress.completed / packageProgress.total) * 100)}%` }} />
              </div>
            </section>
          )}

          {groupLesson && (
            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Студенты группы</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Демонстрационные анонимизированные данные</p>
                </div>
                <Badge variant="secondary">{currentStudents}{capacity ? ` / ${capacity}` : ''}</Badge>
              </div>
              {roster.length ? (
                <div className="overflow-hidden rounded-xl border border-border/70">
                  <div className="hidden grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_minmax(190px,1.2fr)_auto] gap-3 bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                    <span>ФИО</span><span>Телефон</span><span>Email</span><span>Статус</span>
                  </div>
                  {roster.map(student => (
                    <div key={student.id} className="grid gap-1 border-t border-border/60 px-4 py-3 first:border-t-0 md:grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_minmax(190px,1.2fr)_auto] md:items-center md:gap-3">
                      <span className="text-sm font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.phone}</span>
                      <span className="truncate text-xs text-muted-foreground">{student.email}</span>
                      <div className="flex gap-1.5">
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Учится</Badge>
                        <Badge className={student.paymentStatus === 'paid' ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}>
                          {student.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/40 px-4 py-8 text-center text-sm text-red-700">
                  Студентов пока нет — группа находится в наборе или перенесена.
                </div>
              )}
            </section>
          )}

          {!groupLesson && item.type === 'individual' && (
            <section>
              <h3 className="mb-3 text-sm font-semibold">Все найденные занятия пакета</h3>
              <div className="overflow-hidden rounded-xl border border-border/70">
                {importedOccurrences.map((lesson, index) => (
                  <div key={lesson.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{format(lesson.date, 'EEEE, d MMMM', { locale: ru })}</p>
                      <p className="text-xs text-muted-foreground">{lesson.startTime}–{lesson.endTime} · {formatRoomKey(lesson.room)}</p>
                    </div>
                    <Badge variant="outline">{isSameDay(lesson.date, item.date) ? 'Выбрано' : 'В расписании'}</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{groupLesson ? 'Календарь курса' : 'Календарь занятий'}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {groupLesson ? `${occurrences.length} занятий по заявленному расписанию` : `${occurrences.length} занятий найдено в загруженном расписании`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-teal-500" />Занятие</span>
                <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-yellow-300" />Последнее</span>
                <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm border border-red-300 bg-red-50" />Отменено / перенос</span>
              </div>
            </div>
            <CourseCalendar occurrences={occurrences} selectedDate={item.date} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
