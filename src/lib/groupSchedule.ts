import type { ScheduleItem } from '../types';

export type CourseOccurrence = {
  date: Date;
  schedule: ScheduleItem;
  academicHours: number;
};

export function scheduleAcademicHours(item: ScheduleItem): number {
  if (item.academicHours && item.academicHours > 0) return item.academicHours;
  const [sh, sm] = item.startTime.split(':').map(Number);
  const [eh, em] = item.endTime.split(':').map(Number);
  return Math.max(0, ((eh * 60 + em) - (sh * 60 + sm)) / 45);
}

export function endTimeForAcademicHours(startTime: string, academicHours: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const total = hour * 60 + minute + academicHours * 45;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function buildCourseOccurrences(
  startDate: Date | string | undefined,
  totalHours: number,
  schedule: ScheduleItem[] = [],
): CourseOccurrence[] {
  if (!startDate || !totalHours || !schedule.length) return [];
  const valid = schedule.filter(item => item.startTime && item.endTime && scheduleAcademicHours(item) > 0);
  if (!valid.length) return [];
  const cursor = new Date(startDate);
  cursor.setHours(12, 0, 0, 0);
  const result: CourseOccurrence[] = [];
  let accumulated = 0;
  for (let offset = 0; offset < 730 && accumulated < totalHours; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + offset);
    valid.filter(item => item.dayOfWeek === date.getDay()).forEach(item => {
      if (accumulated >= totalHours) return;
      const academicHours = Math.min(scheduleAcademicHours(item), totalHours - accumulated);
      result.push({ date: new Date(date), schedule: item, academicHours });
      accumulated += academicHours;
    });
  }
  return result;
}

export function nextCourseStart(endDate: Date, schedule: ScheduleItem[]): Date {
  const cursor = new Date(endDate);
  cursor.setHours(12, 0, 0, 0);
  for (let offset = 1; offset <= 14; offset += 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() + offset);
    if (schedule.some(item => item.dayOfWeek === date.getDay())) return date;
  }
  return cursor;
}
