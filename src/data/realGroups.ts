import type { ScheduleItem } from '../types';
import { demoScheduleAugust2026, type DemoScheduleSeed } from './demoScheduleAugust2026';
import { demoTeacherOptions } from './demoTeachers';
import { importedStudents } from './importedStudents';

export interface RealGroup {
  id: string;
  name: string;
  code: string;
  language: 'German' | 'English';
  level: string;
  courseType: string;
  hours: number;
  price: number;
  teacherId: string | null;
  teacherName: string;
  textbook: string;
  startDate: Date;
  endDate: Date;
  schedule: ScheduleItem[];
  studentIds: string[];
  maxStudents: number;
  status: 'active' | 'completed' | 'planned';
}

const teacherNames = new Map(demoTeacherOptions.map(teacher => [teacher.id, teacher.name]));
const referenceDate = new Date(2026, 7, 19);

function parseCourseRange(name: string, fallbackStart: Date, fallbackEnd: Date): [Date, Date] {
  const match = name.match(/(\d{2})\.(\d{2})\s*[-–]\s*(\d{2})\.(\d{2})/);
  if (!match) return [fallbackStart, fallbackEnd];
  const start = new Date(2026, Number(match[2]) - 1, Number(match[1]));
  const end = new Date(2026, Number(match[4]) - 1, Number(match[3]));
  if (end < start) end.setFullYear(end.getFullYear() + 1);
  return [start, end];
}

function courseHours(courseType: string): number {
  if (courseType === 'intensive') return 36;
  if (courseType === 'mini') return 24;
  if (courseType === 'club') return 16;
  if (courseType === 'phonetics') return 20;
  if (courseType === 'grammar') return 24;
  return 48;
}

function coursePrice(courseType: string, language: string): number {
  if (courseType === 'club') return 9000;
  if (courseType === 'intensive') return 36500;
  if (courseType === 'mini') return 24000;
  return language === 'English' ? 34000 : 39000;
}

function textbook(language: string, level: string): string {
  if (language === 'English') return `Roadmap ${level.replace(/[^ABC\d]/g, '') || 'B1'}`;
  const major = level.match(/[ABC]\d/)?.[0] || 'A2';
  return `Schritte International Neu ${major}`;
}

function stableNumber(value: string): number {
  return Array.from(value).reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function selectStudents(groupId: string, language: 'German' | 'English', level: string, count: number): string[] {
  if (count <= 0) return [];
  const majorLevel = level.match(/[ABC]\d/)?.[0];
  const exact = importedStudents.filter(student => student.language === language && (!majorLevel || student.currentLevel === majorLevel));
  const pool = exact.length >= count ? exact : importedStudents.filter(student => student.language === language);
  const offset = stableNumber(groupId) % Math.max(pool.length, 1);
  return Array.from({ length: Math.min(count, pool.length) }, (_, index) => pool[(offset + index * 5) % pool.length].id)
    .filter((studentId, index, values) => values.indexOf(studentId) === index);
}

function buildGroup(groupId: string, events: DemoScheduleSeed[]): RealGroup {
  const first = events[0];
  const name = first.groupName || 'Учебная группа';
  const language = first.groupLanguage === 'English' ? 'English' : 'German';
  const level = first.groupLevel || name.match(/\b[ABC]\d(?:[.+]\d+)?\b/i)?.[0]?.toUpperCase() || 'A2';
  const courseType = first.courseType || first.lessonType;
  const eventDates = events.map(event => new Date(`${event.date}T12:00:00`));
  const fallbackStart = new Date(Math.min(...eventDates.map(date => date.getTime())));
  const fallbackEnd = new Date(Math.max(...eventDates.map(date => date.getTime())));
  const [startDate, endDate] = parseCourseRange(name, fallbackStart, fallbackEnd);
  const teacherCounts = new Map<string, number>();
  events.forEach(event => teacherCounts.set(event.teacherId, (teacherCounts.get(event.teacherId) || 0) + 1));
  const teacherId = Array.from(teacherCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const scheduleMap = new Map<string, ScheduleItem>();
  events.forEach(event => {
    const eventDate = new Date(`${event.date}T12:00:00`);
    const key = `${eventDate.getDay()}-${event.startTime}-${event.endTime}-${event.classroomName || ''}`;
    if (scheduleMap.has(key)) return;
    const room = event.classroomName;
    scheduleMap.set(key, {
      dayOfWeek: eventDate.getDay(),
      startTime: event.startTime,
      endTime: event.endTime,
      classroom: room && !room.startsWith('zoom') ? room : undefined,
      zoomRoom: room?.startsWith('zoom') ? room : undefined,
    });
  });
  const currentStudents = Math.max(0, ...events.map(event => Number(event.currentStudents || 0)));
  const capacity = Math.max(currentStudents, ...events.map(event => Number(event.capacity || 0)), courseType === 'club' ? 8 : 1);
  const allCancelled = events.every(event => event.status === 'cancelled');
  const recruiting = events.some(event => event.status === 'recruiting');
  const status: RealGroup['status'] = endDate < referenceDate
    ? 'completed'
    : startDate > referenceDate || allCancelled || (recruiting && currentStudents === 0)
      ? 'planned'
      : 'active';

  return {
    id: groupId,
    name,
    code: groupId.replace(/^course-/, '').toUpperCase(),
    language,
    level,
    courseType,
    hours: courseHours(courseType),
    price: coursePrice(courseType, language),
    teacherId,
    teacherName: teacherId ? teacherNames.get(teacherId) || 'Преподаватель не назначен' : 'Преподаватель не назначен',
    textbook: courseType === 'club' ? '' : textbook(language, level),
    startDate,
    endDate,
    schedule: Array.from(scheduleMap.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)),
    studentIds: selectStudents(groupId, language, level, currentStudents || (courseType === 'club' ? 6 : 0)),
    maxStudents: capacity,
    status,
  };
}

const eventsByGroup = new Map<string, DemoScheduleSeed[]>();
demoScheduleAugust2026.forEach(event => {
  if (!event.groupId) return;
  const events = eventsByGroup.get(event.groupId) || [];
  events.push(event);
  eventsByGroup.set(event.groupId, events);
});

// Groups, lessons and rosters are different projections of the same seed.
export const realGroups: RealGroup[] = Array.from(eventsByGroup.entries())
  .map(([groupId, events]) => buildGroup(groupId, events))
  .sort((a, b) => a.startDate.getTime() - b.startDate.getTime() || a.name.localeCompare(b.name, 'ru'));
