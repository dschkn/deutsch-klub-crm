import { TeacherScheduleItem, CellComment, TeacherComment, Group } from '../../types';
import { Teacher } from '../../types';
import { realGroups } from '../../data/realGroups';
import { DataStore } from '../../data/store';
import { isSameDay } from 'date-fns';
import { format, startOfWeek } from 'date-fns';

export function getStatusStyle(status: string, STATUS_MAP: Record<string, { bg: string; border: string; text: string; label: string; textClass?: string }>) {
  return STATUS_MAP[status] || STATUS_MAP.unavailable;
}

export function getScheduleForDay(teacher: Teacher, date: Date): TeacherScheduleItem[] {
  const store = DataStore.getInstance();
  const storeItems = store.getAllScheduleItems().filter(si =>
    si.teacherId === teacher.user.id && isSameDay(si.start, date)
  );
  return storeItems.map(si => {
    const rg = si.groupId ? realGroups.find(g => g.id === si.groupId) : undefined;
    const startTime = `${String(si.start.getHours()).padStart(2,'0')}:${String(si.start.getMinutes()).padStart(2,'0')}`;
    const endTime = `${String(si.end.getHours()).padStart(2,'0')}:${String(si.end.getMinutes()).padStart(2,'0')}`;
    return {
      id: si.id,
      groupId: si.groupId,
      teacherId: si.teacherId,
      date: si.start,
      startTime,
      endTime,
      type: si.lessonType as TeacherScheduleItem['type'],
      status: si.status === 'cancelled' ? 'cancelled' as const : si.status as TeacherScheduleItem['status'],
      group: rg ? {
        id: rg.id,
        name: si.groupName || rg.name,
        language: (si.groupLanguage || rg.language) as 'German' | 'English',
        level: (si.groupLevel || rg.level) as Group['level'],
        teacher: teacher.user,
        schedule: [],
        startDate: rg.startDate,
        status: rg.status,
        students: [],
        price: rg.price || 0,
        maxStudents: 12,
      } : si.groupId ? {
        id: si.groupId,
        name: si.groupName || 'Группа',
        language: (si.groupLanguage || 'German') as 'German' | 'English',
        level: (si.groupLevel || 'A1') as Group['level'],
        teacher: teacher.user,
        schedule: [],
        startDate: new Date(),
        status: 'active' as const,
        students: [],
        maxStudents: 12,
        price: 0,
      } : undefined,
      classroom: si.classroomName || undefined,
      zoomRoom: undefined,
      studentId: si.studentId,
      studentName: si.studentName,
      format: si.format as 'online' | 'offline' | undefined,
      comment: undefined,
      groupName: si.groupName,
      groupLevel: si.groupLevel,
      groupLanguage: si.groupLanguage,
      courseType: si.courseType,
      teacherName: si.teacherName,
      capacity: si.capacity,
      currentStudents: si.currentStudents,
      paymentType: si.studentId ? 'single' as const : undefined,
    };
  });
}

export function getWeekKey(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return format(start, 'yyyy-MM-dd');
}

export function loadComments(weekKey: string): CellComment[] {
  try {
    const data = localStorage.getItem(`schedule_comments_${weekKey}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveComments(weekKey: string, comments: CellComment[]) {
  localStorage.setItem(`schedule_comments_${weekKey}`, JSON.stringify(comments));
}

export function cleanTeacherComments(comments: TeacherComment[]): TeacherComment[] {
  return comments.filter(c => c.text && c.text.trim().length > 1);
}

export function loadTeacherComments(weekKey: string): TeacherComment[] {
  try {
    const data = localStorage.getItem(`teacher_comments_${weekKey}`);
    const comments = data ? JSON.parse(data) : [];
    const cleaned = Array.isArray(comments) ? cleanTeacherComments(comments) : [];
    if (cleaned.length !== (Array.isArray(comments) ? comments.length : 0)) {
      localStorage.setItem(`teacher_comments_${weekKey}`, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch { return []; }
}

export function saveTeacherComments(weekKey: string, comments: TeacherComment[]) {
  localStorage.setItem(`teacher_comments_${weekKey}`, JSON.stringify(cleanTeacherComments(comments)));
}

export function loadIndividualLessons(): TeacherScheduleItem[] {
  try {
    const data = localStorage.getItem('individual_lessons');
    if (!data) return [];

    type StoredLesson = Omit<TeacherScheduleItem, 'date' | 'originalDate'> & {
      date: string;
      originalDate?: string;
    };
    const lessons = JSON.parse(data) as StoredLesson[];

    return lessons.map(lesson => ({
      ...lesson,
      date: new Date(lesson.date),
      originalDate: lesson.originalDate ? new Date(lesson.originalDate) : undefined,
    }));
  } catch { return []; }
}

export function saveIndividualLessons(lessons: TeacherScheduleItem[]) {
  localStorage.setItem('individual_lessons', JSON.stringify(lessons));
}
