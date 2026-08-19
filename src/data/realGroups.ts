import type { ScheduleItem } from '../types';

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
  status: 'active' | 'completed' | 'planned';
}

function date(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

// Synthetic groups preserve the UI scenarios without exposing school records.
export const realGroups: RealGroup[] = [
  {
    id: 'group-demo-001',
    name: 'Немецкий A1 — утренняя группа',
    code: 'DEMO-DE-A1-01',
    language: 'German',
    level: 'A1',
    courseType: 'group',
    hours: 48,
    price: 32000,
    teacherId: 't1',
    teacherName: 'Борков Евсей',
    textbook: 'Demo textbook A1',
    startDate: date(2026, 8, 10),
    endDate: date(2026, 11, 28),
    schedule: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '11:30', classroom: 'room1' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '11:30', classroom: 'room1' },
    ],
    status: 'active',
  },
  {
    id: 'group-demo-002',
    name: 'Немецкий B1 — вечерняя онлайн-группа',
    code: 'DEMO-DE-B1-01',
    language: 'German',
    level: 'B1',
    courseType: 'group',
    hours: 48,
    price: 34000,
    teacherId: 't2',
    teacherName: 'Инна Силантьева',
    textbook: 'Demo textbook B1',
    startDate: date(2026, 8, 12),
    endDate: date(2026, 12, 3),
    schedule: [
      { dayOfWeek: 2, startTime: '19:00', endTime: '20:30', zoomRoom: 'zoom1' },
      { dayOfWeek: 4, startTime: '19:00', endTime: '20:30', zoomRoom: 'zoom1' },
    ],
    status: 'active',
  },
  {
    id: 'group-demo-003',
    name: 'English Conversation Club — B2',
    code: 'DEMO-EN-B2-CLUB',
    language: 'English',
    level: 'B2',
    courseType: 'club',
    hours: 12,
    price: 8000,
    teacherId: 't3',
    teacherName: 'Юна Паршина',
    textbook: '',
    startDate: date(2026, 9, 5),
    endDate: date(2026, 10, 24),
    schedule: [
      { dayOfWeek: 6, startTime: '12:00', endTime: '13:30', classroom: 'room2' },
    ],
    status: 'planned',
  },
  {
    id: 'group-demo-004',
    name: 'Немецкий A2 — завершённая группа',
    code: 'DEMO-DE-A2-ARCHIVE',
    language: 'German',
    level: 'A2',
    courseType: 'intensive',
    hours: 24,
    price: 18000,
    teacherId: 't4',
    teacherName: 'Белецкая Алина',
    textbook: 'Demo textbook A2',
    startDate: date(2026, 4, 6),
    endDate: date(2026, 5, 4),
    schedule: [
      { dayOfWeek: 1, startTime: '18:00', endTime: '20:00', classroom: 'room3' },
      { dayOfWeek: 3, startTime: '18:00', endTime: '20:00', classroom: 'room3' },
    ],
    status: 'completed',
  },
];
