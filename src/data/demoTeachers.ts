import type { User } from '../types';

export interface DemoTeacherOption {
  id: string;
  name: string;
  isOnlineOnly?: boolean;
}

export const demoTeacherOptions: DemoTeacherOption[] = Array.from(
  { length: 25 },
  (_, index) => ({
    id: `t${index + 1}`,
    name: `Преподаватель ${String(index + 1).padStart(2, '0')}`,
    isOnlineOnly: index === 0 || index === 10,
  }),
);

export const demoTeacherUserMap = Object.fromEntries(
  demoTeacherOptions.map((teacher, index) => [
    teacher.id,
    {
      id: teacher.id,
      name: teacher.name,
      email: `teacher${String(index + 1).padStart(2, '0')}@example.com`,
      phone: '',
      role: 'teacher',
    } satisfies User,
  ]),
) as Record<string, User>;
