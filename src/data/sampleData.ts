import { User, Lead, Student, Group, Task, ChatConversation, Teacher, Payment, ClubEvent, Permission, Lesson, ActivityItem, ScheduleItem, Vacation, TeacherStatistics, EventRegistration } from '../types';
import type {
  NormalizedStudent,
  NormalizedGroup,
  NormalizedTeacher,
  NormalizedLesson,
  NormalizedPayment,
  NormalizedUser,
  NormalizedTask,
  NormalizedChatConversation,
  NormalizedClubEvent,
  NormalizedEventRegistration,
  NormalizedVacation,
} from '../types/normalized';
import { importedStudents } from './importedStudents';
import { realGroups } from './realGroups';
import { demoTeacherOptions } from './demoTeachers';
import { demoScheduleAugust2026 } from './demoScheduleAugust2026';
import { DataStore } from './store';

const germanFirstNames = ['Anna', 'Hans', 'Maria', 'Peter', 'Klaus', 'Greta', 'Friedrich', 'Helena', 'Maximilian', 'Sophia', 'Alexander', 'Clara', 'Sebastian', 'Emma', 'Leon', 'Lena', 'Felix', 'Mia', 'Jonas', 'Lea', 'Tim', 'Laura', 'Niklas', 'Julia', 'David', 'Sarah', 'Paul', 'Lisa', 'Jan', 'Marie'];
const russianFirstNames = ['Alexey', 'Dmitry', 'Ivan', 'Maria', 'Anna', 'Elena', 'Sergey', 'Olga', 'Nikolay', 'Tatiana', 'Andrei', 'Natalia', 'Vladimir', 'Ekaterina', 'Pavel', 'Anastasia', 'Mikhail', 'Svetlana', 'Dmitri', 'Irina'];

const lastNames = ['Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schroeder', 'Neumann', 'Schwarz', 'Braun', 'Zimmermann', 'Krueger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Krause', 'Meier', 'Lehmann'];
const russianLastNames = ['Ivanov', 'Petrov', 'Sidorov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Volkov', 'Solovyov', 'Vasilyev', 'Zaytsev', 'Pavlov', 'Semyonov', 'Golubev', 'Voronov', 'Fedorov', 'Mikhailov'];

const sources: Lead['source'][] = ['website', 'instagram', 'facebook', 'referral', 'google', 'walk_in', 'vk'];
const languages: ('German' | 'English')[] = ['German', 'English'];
const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const leadStatuses: Lead['status'][] = ['new', 'contacted', 'trial_lesson', 'interested', 'student', 'lost'];
const taskStatuses: Task['status'][] = ['new', 'in_progress', 'waiting', 'completed'];
const priorities: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generatePhone(): string {
  return `+1 202-555-${randomInt(100, 199)}`;
}

function generateEmail(name: string): string {
  const transliterated = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  return `${transliterated || 'demo'}${randomInt(1, 999)}@example.com`;
}

export const users: User[] = [
  { id: 'u1', name: 'Демо-директор', email: 'director@example.com', phone: '+1 202-555-0100', role: 'director' },
  { id: 'u2', name: 'Демо-заместитель', email: 'deputy@example.com', phone: '+1 202-555-0110', role: 'deputy_director' },
  { id: 'u3', name: 'Демо-менеджер 01', email: 'manager01@example.com', phone: '+1 202-555-0111', role: 'manager' },
  { id: 'u4', name: 'Демо-менеджер 02', email: 'manager02@example.com', phone: '+1 202-555-0112', role: 'manager' },
  ...demoTeacherOptions.map((t, i) => ({
    id: t.id,
    name: t.name,
    email: `teacher${String(i + 1).padStart(2, '0')}@example.com`,
    phone: `+1 202-555-${String(120 + i).padStart(4, '0')}`,
    role: 'teacher' as const,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`,
    isOnlineOnly: t.isOnlineOnly,
  })),
  { id: 'u9', name: 'Демо-администратор 01', email: 'admin01@example.com', phone: '+1 202-555-0113', role: 'administrator' },
  { id: 'u10', name: 'Демо-администратор 02', email: 'admin02@example.com', phone: '+1 202-555-0114', role: 'administrator' },
];

const managers = users.filter(u => u.role === 'manager' || u.role === 'director' || u.role === 'deputy_director');
const teachers = users.filter(u => u.role === 'teacher');

function generateStudentName(): string {
  const useRussian = Math.random() > 0.3;
  if (useRussian) {
    return `${randomElement(russianFirstNames)} ${randomElement(russianLastNames)}`;
  } else {
    return `${randomElement(germanFirstNames)} ${randomElement(lastNames)}`;
  }
}

function generateActivityHistory(): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const types: ActivityItem['type'][] = ['call', 'email', 'meeting', 'note', 'status_change'];
  const count = randomInt(2, 6);

  for (let i = 0; i < count; i++) {
    activities.push({
      id: generateId(),
      type: randomElement(types),
      description: randomElement([
        'Initial contact made via phone',
        'Sent course information via email',
        'Follow-up call scheduled',
        'Trial lesson completed',
        'Discussed pricing options',
        'Student expressed interest in intensive course',
        'Sent placement test results',
        'Scheduled consultation meeting',
        'Left voicemail message',
      ]),
      createdAt: randomDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), new Date()),
      user: randomElement(managers),
    });
  }

  return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function generateLeads(count: number): Lead[] {
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const name = generateStudentName();
    const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

    leads.push({
      id: generateId(),
      name,
      phone: generatePhone(),
      email: generateEmail(name),
      source: randomElement(sources),
      language: randomElement(languages),
      status: randomElement(leadStatuses),
      notes: randomElement([
        'Interested in intensive course',
        'Prefers evening classes',
        'Has prior experience with the language',
        'Complete beginner',
        'Needs flexible schedule',
        'Wants to prepare for Goethe exam',
        'Looking for business German course',
        'Interested in group lessons',
      ]),
      assignedManager: randomElement(managers),
      createdAt,
      updatedAt: new Date(createdAt.getTime() + randomInt(0, 7) * 24 * 60 * 60 * 1000),
      activityHistory: generateActivityHistory(),
    });
  }

  return leads;
}

export function generateStudents(count: number): Student[] {
  const students: Student[] = [];

  for (let i = 0; i < count; i++) {
    const name = generateStudentName();

    students.push({
      id: generateId(),
      name,
      phone: generatePhone(),
      email: generateEmail(name),
      currentLevel: randomElement(levels),
      language: randomElement(languages),
      status: randomElement(['active', 'active', 'active', 'active', 'inactive', 'frozen']),
      paymentStatus: randomElement(['paid', 'paid', 'paid', 'pending', 'overdue']),
      joinDate: randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()),
      balance: randomInt(-500, 500),
      notes: randomElement([
        'Excellent progress',
        'Needs additional speaking practice',
        'Very motivated student',
        'Occasionally misses classes',
        'Preparing for B2 exam',
        'Prefers online classes',
        'Works in IT sector',
        'Planning to move to Germany',
      ]),
    });
  }

  return students;
}

export const allStudents = importedStudents;

function generateSchedule(): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const days = [1, 2, 3, 4, 5];
  const times = [
    { start: '09:00', end: '10:30' },
    { start: '11:00', end: '12:30' },
    { start: '14:00', end: '15:30' },
    { start: '16:00', end: '17:30' },
    { start: '18:00', end: '19:30' },
    { start: '19:45', end: '21:15' },
  ];

  const selectedDays = days.sort(() => Math.random() - 0.5).slice(0, randomInt(2, 3));
  const selectedTime = randomElement(times);

  selectedDays.forEach(day => {
    schedule.push({
      dayOfWeek: day,
      startTime: selectedTime.start,
      endTime: selectedTime.end,
      classroom: Math.random() > 0.5 ? `Room ${randomInt(1, 5)}` : undefined,
      zoomRoom: Math.random() > 0.7 ? 'https://zoom.us/j/' + generateId() : undefined,
    });
  });

  return schedule;
}

const groupNames = {
  German: ['Berlin', 'Munchen', 'Hamburg', 'Frankfurt', 'Koln', 'Dresden', 'Leipzig', 'Stuttgart', 'Dusseldorf', 'Nurnberg', 'Hannover', 'Bremen'],
  English: ['Cambridge', 'Oxford', 'London', 'Manchester', 'Liverpool', 'Edinburgh', 'York', 'Bath', 'Brighton', 'Bristol'],
};

export function generateGroups(count: number): Group[] {
  const groups: Group[] = [];

  languages.forEach(language => {
    levels.forEach(level => {
      const numGroups = randomInt(1, 3);
      for (let i = 0; i < numGroups; i++) {
        const startIdx = groups.length;
        if (startIdx >= count) return;

        const usedNames = groups.filter(g => g.language === language).map(g => g.name);
        const availableNames = (groupNames[language] as string[]).filter(n => !usedNames.includes(n));

        if (availableNames.length === 0) continue;

        const groupStudents = allStudents
          .filter(s => s.language === language && s.status === 'active')
          .sort(() => Math.random() - 0.5)
          .slice(0, randomInt(4, 12));

        groups.push({
          id: generateId(),
          name: randomElement(availableNames),
          language,
          level,
          teacher: randomElement(teachers),
          schedule: generateSchedule(),
          startDate: randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          status: randomElement(['active', 'active', 'active', 'planned']),
          students: groupStudents,
          maxStudents: 12,
          price: randomInt(8000, 15000),
        });
      }
    });
  });

  return groups.slice(0, count);
}

export const allGroups: Group[] = realGroups.map(group => ({
  id: group.id,
  name: group.name,
  language: group.language,
  level: (group.level.match(/[ABC]\d/)?.[0] || 'A2') as Group['level'],
  teacher: users.find(user => user.id === group.teacherId) || users.find(user => user.role === 'teacher')!,
  schedule: group.schedule,
  startDate: group.startDate,
  endDate: group.endDate,
  status: group.status,
  students: group.studentIds
    .map(studentId => allStudents.find(student => student.id === studentId))
    .filter(Boolean) as Student[],
  maxStudents: group.maxStudents,
  price: group.price,
}));

export function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const taskTitles = [
    'Call new lead',
    'Send course materials',
    'Prepare lesson plan',
    'Follow up on trial lesson',
    'Update student records',
    'Schedule make-up class',
    'Send payment reminder',
    'Prepare progress report',
    'Organize conversation club',
    'Update attendance records',
    'Review homework submissions',
    'Plan next module content',
    'Contact inactive students',
    'Prepare exam materials',
    'Schedule group consultation',
  ];

  for (let i = 0; i < count; i++) {
    tasks.push({
      id: generateId(),
      title: randomElement(taskTitles),
      description: randomElement([
        'Priority task that needs immediate attention',
        'Regular scheduled task',
        'Follow-up required after initial contact',
        'Administrative task',
        'Teaching preparation task',
      ]),
      status: randomElement(taskStatuses),
      assignee: randomElement([...managers, ...teachers]),
      dueDate: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      priority: randomElement(priorities),
      createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
    });
  }

  return tasks;
}

export const allTasks = generateTasks(35);

function generateMessages(): ChatConversation['messages'] {
  const messages: ChatConversation['messages'] = [];
  const responses = [
    'Hello! How can I help you today?',
    'I would like to know more about your German courses',
    'Of course! We have courses for all levels from A1 to C2',
    'What is the price for the intensive course?',
    'Our intensive course costs 12,000 rubles per month',
    'Is it possible to have a trial lesson?',
    'Yes, we offer a free trial lesson. When would be convenient?',
    'Tomorrow at 6 PM would work for me',
    'Great, I will book that for you!',
    'Thank you very much!',
  ];

  responses.forEach((content, i) => {
    messages.push({
      id: generateId(),
      content,
      sentAt: new Date(Date.now() - (responses.length - i) * 5 * 60 * 1000 + randomInt(0, 2 * 60 * 1000)),
      isFromUs: i % 2 === 1,
      status: randomElement(['sent', 'delivered', 'read']),
    });
  });

  return messages;
}

export function generateConversations(count: number): ChatConversation[] {
  const conversations: ChatConversation[] = [];
  const channels: ChatConversation['channel'][] = ['telegram', 'whatsapp', 'vk'];

  for (let i = 0; i < count; i++) {
    const name = generateStudentName();
    const messages = generateMessages();

    conversations.push({
      id: generateId(),
      channel: randomElement(channels),
      contactName: name,
      contactPhone: generatePhone(),
      lastMessage: messages[messages.length - 1]?.content || '',
      lastMessageTime: new Date(Date.now() - randomInt(0, 60) * 60 * 1000),
      unread: Math.random() > 0.6 ? randomInt(1, 5) : 0,
      tags: randomElement([[], ['VIP'], ['New Lead'], ['Returning'], ['English']]),
      notes: randomElement(['Interested in intensive course', 'Prefers evening classes', '', 'Needs follow-up']),
      messages,
    });
  }

  return conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
}

export const allConversations = generateConversations(25);

export function generateTeachers(): Teacher[] {
  return teachers.map((teacher, index) => {
    const teacherGroups = allGroups.filter(g => g.teacher.id === teacher.id);
    const teacherLessons = demoScheduleAugust2026.filter(item => item.teacherId === teacher.id);

    const statistics: TeacherStatistics = {
      totalStudents: teacherGroups.reduce((sum, g) => sum + g.students.length, 0),
      activeGroups: teacherGroups.filter(group => group.status === 'active').length,
      completedLessons: 84 + teacherLessons.length * 3 + index * 2,
      averageRating: 4.6 + (index % 4) * 0.1,
      totalHours: 190 + teacherLessons.length * 2 + index * 7,
    };

    const vacations: Vacation[] = [
      {
        id: `vacation-${teacher.id}-2026`,
        startDate: new Date(2026, 9, 5 + (index % 10)),
        endDate: new Date(2026, 9, 12 + (index % 10)),
        type: 'vacation',
        status: index % 5 === 0 ? 'pending' : 'approved',
      },
    ];

    return {
      user: teacher,
      languages: teacherLessons.some(item => item.groupLanguage === 'English') ? ['English'] : ['German'],
      specializations: [
        ['Грамматика', 'Разговорная практика'],
        ['Интенсивы', 'Подготовка к экзаменам'],
        ['Фонетика', 'Разговорные клубы'],
        ['Индивидуальные занятия'],
      ][index % 4],
      hourlyRate: 1700 + (index % 6) * 250,
      groups: teacherGroups,
      schedule: [],
      vacations,
      statistics,
      isOnlineOnly: teacher.isOnlineOnly,
      weeklyNote: [
        'Предпочитает получать замены минимум за сутки.',
        'Готов вести тестирования в свободных окнах.',
        'По пятницам работает только онлайн.',
        'Можно предлагать новые вечерние группы.',
      ][index % 4],
    };
  });
}

export const allTeachers = generateTeachers();

export function generatePayments(count: number): Payment[] {
  return allStudents.slice(0, count).map((student, index) => {
    const group = allGroups.find(candidate => candidate.students.some(member => member.id === student.id));
    const dueDate = new Date(2026, 7, 10 + (index % 15));
    const status: Payment['status'] = student.paymentStatus;
    return {
      id: `payment-demo-${String(index + 1).padStart(3, '0')}`,
      student,
      amount: group ? Math.round(group.price / 2) : 12500,
      dueDate,
      paidDate: status === 'paid' ? new Date(2026, 7, 8 + (index % 12)) : undefined,
      status,
      method: status === 'paid' ? (['card', 'transfer', 'online'] as const)[index % 3] : undefined,
      description: group ? `Оплата курса ${group.name}` : 'Пакет индивидуальных занятий',
      group,
    };
  });
}

export const allPayments = generatePayments(80);

export function generateEvents(): ClubEvent[] {
  const events: ClubEvent[] = [];
  const eventTitles = [
    'German Conversation Club',
    'English Movie Night',
    'Goethe Exam Preparation Workshop',
    'Business German Seminar',
    'Cultural Exchange Evening',
    'German Board Games Night',
    'English Pronunciation Workshop',
    'Language Exchange Meetup',
    'German Writing Workshop',
    'English Conversation Club',
  ];

  for (let i = 0; i < 15; i++) {
    const date = new Date(Date.now() + (i - 5) * 7 * 24 * 60 * 60 * 1000);
    const capacity = randomInt(10, 30);
    const registrations: EventRegistration[] = allStudents
      .sort(() => Math.random() - 0.5)
      .slice(0, randomInt(capacity * 0.3, capacity * 0.9))
      .map(student => ({
        id: generateId(),
        student,
        registeredAt: randomDate(new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000), date),
        attended: date < new Date() ? Math.random() > 0.2 : false,
      }));

    events.push({
      id: generateId(),
      title: eventTitles[i % eventTitles.length],
      description: randomElement([
        'An evening of relaxed conversation practice',
        'Join us for an educational and social event',
        'Practice your language skills in a fun setting',
        'Professional workshop for exam candidates',
      ]),
      date,
      startTime: '18:00',
      endTime: '20:00',
      location: randomElement(['Main Hall', 'Room 1', 'Room 2', 'Cafeteria', 'Online']),
      capacity,
      registrations,
      status: date < new Date() ? 'completed' : (registrations.length >= capacity ? 'full' : 'registration_open'),
      language: randomElement(languages),
    });
  }

  return events;
}

export const allEvents = generateEvents();

export const permissions: Permission[] = [
  { id: 'p1', name: 'view_dashboard', description: 'View dashboard', module: 'Dashboard' },
  { id: 'p2', name: 'manage_leads', description: 'Create, edit, and delete leads', module: 'Leads' },
  { id: 'p3', name: 'view_leads', description: 'View leads only', module: 'Leads' },
  { id: 'p4', name: 'manage_students', description: 'Create, edit, and delete students', module: 'Students' },
  { id: 'p5', name: 'view_students', description: 'View students only', module: 'Students' },
  { id: 'p6', name: 'manage_groups', description: 'Create, edit, and delete groups', module: 'Groups' },
  { id: 'p7', name: 'view_groups', description: 'View groups only', module: 'Groups' },
  { id: 'p8', name: 'manage_tasks', description: 'Create, edit, and delete tasks', module: 'Tasks' },
  { id: 'p9', name: 'view_tasks', description: 'View tasks only', module: 'Tasks' },
  { id: 'p10', name: 'manage_chats', description: 'Manage conversations and notes', module: 'Chats' },
  { id: 'p11', name: 'view_chats', description: 'View chats only', module: 'Chats' },
  { id: 'p12', name: 'manage_teachers', description: 'Manage teacher profiles', module: 'Teachers' },
  { id: 'p13', name: 'view_teachers', description: 'View teachers only', module: 'Teachers' },
  { id: 'p14', name: 'manage_schedule', description: 'Edit teacher and admin schedules', module: 'Schedule' },
  { id: 'p15', name: 'view_schedule', description: 'View schedules only', module: 'Schedule' },
  { id: 'p16', name: 'manage_payments', description: 'Create, edit, and delete payments', module: 'Payments' },
  { id: 'p17', name: 'view_payments', description: 'View payments only', module: 'Payments' },
  { id: 'p18', name: 'manage_events', description: 'Create, edit, and delete events', module: 'Events' },
  { id: 'p19', name: 'view_events', description: 'View events only', module: 'Events' },
  { id: 'p20', name: 'manage_permissions', description: 'Edit role permissions', module: 'Settings' },
  { id: 'p21', name: 'view_reports', description: 'View reports and analytics', module: 'Reports' },
  { id: 'p22', name: 'export_data', description: 'Export data from the system', module: 'Reports' },
];

export const rolePermissions: { role: string; permissions: string[] }[] = [
  { role: 'director', permissions: permissions.map(p => p.name) },
  { role: 'deputy_director', permissions: ['view_dashboard', 'manage_leads', 'manage_students', 'manage_groups', 'manage_tasks', 'manage_chats', 'manage_teachers', 'manage_schedule', 'manage_payments', 'manage_events', 'view_reports', 'export_data'] },
  { role: 'manager', permissions: ['view_dashboard', 'manage_leads', 'view_students', 'manage_students', 'view_groups', 'manage_tasks', 'manage_chats', 'view_teachers', 'view_schedule', 'view_payments', 'manage_payments', 'view_events', 'manage_events', 'view_reports'] },
  { role: 'teacher', permissions: ['view_dashboard', 'view_leads', 'view_students', 'view_groups', 'manage_tasks', 'view_tasks', 'view_chats', 'view_schedule', 'view_events'] },
  { role: 'administrator', permissions: ['view_dashboard', 'view_leads', 'view_students', 'view_groups', 'manage_tasks', 'manage_chats', 'manage_schedule', 'view_payments', 'manage_events'] },
];

export function generateLessons(count: number): Lesson[] {
  const lessons: Lesson[] = [];
  const topics = [
    'Introduction to cases',
    'Present tense revision',
    'Modal verbs',
    'Separable verbs',
    'Accusative case',
    'Dative case',
    'Perfect tense',
    'Imperfect tense',
    'Relative clauses',
    'Passive voice',
    'Subjunctive mood',
    'Business vocabulary',
    'Conversation practice',
    'Writing skills',
    'Listening comprehension',
  ];

  for (let i = 0; i < count; i++) {
    const group = randomElement(allGroups);
    const date = new Date(Date.now() + (randomInt(-14, 14)) * 24 * 60 * 60 * 1000);

    lessons.push({
      id: generateId(),
      group,
      date,
      startTime: '18:00',
      endTime: '19:30',
      topic: randomElement(topics),
      status: date < new Date() ? 'completed' : 'scheduled',
      attendance: group.students.map(student => ({
        student,
        present: Math.random() > 0.15,
      })),
      classroom: `Room ${randomInt(1, 5)}`,
    });
  }

  return lessons;
}

export const allLessons = generateLessons(60);

export function getKpiData() {
  return {
    newLeadsToday: randomInt(5, 15),
    activeStudents: allStudents.filter(s => s.status === 'active').length,
    monthlyRevenue: randomInt(500000, 800000),
    overduePayments: allPayments.filter(p => p.status === 'overdue').length,
    upcomingLessons: allLessons.filter(l => l.status === 'scheduled' && l.date.getDate() === new Date().getDate()).length,
  };
}

export function getLeadsBySource() {
  return sources.map(source => ({
    name: source,
    value: randomInt(10, 50),
  }));
}

export function getRevenueByMonth() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    name: month,
    revenue: randomInt(400000, 900000),
    students: randomInt(80, 150),
  }));
}

export function getRetentionData() {
  return levels.map(level => ({
    name: level,
    retention: randomInt(60, 95),
  }));
}

// ============================================================
//  STORE SEEDING — Convert old types → Normalized & import
// ============================================================

function _oldToNormStudent(s: Student): NormalizedStudent {
  return {
    id: s.id,
    fullName: s.name,
    phones: s.phone ? [s.phone] : [],
    emails: s.email ? [s.email] : [],
    language: s.language,
    level: s.currentLevel,
    status: s.status,
    paymentStatus: s.paymentStatus,
    balance: s.balance,
    birthDate: s.birthDate,
    profession: s.profession,
    source: s.howDidYouKnow,
    preferredDays: s.days || [],
    preferredTimes: s.times || [],
    preferredFormat: s.format,
    groupIds: [],
    contractIds: [],
    paymentIds: [],
    lessonIds: [],
    taskIds: [],
    chatIds: [],
    testingIds: [],
    notes: s.notes ? [s.notes] : [],
    createdAt: s.joinDate,
    updatedAt: s.joinDate,
  };
}

function _oldToNormGroup(g: Group): NormalizedGroup {
  const source = realGroups.find(group => group.id === g.id);
  return {
    id: g.id,
    name: g.name,
    code: source?.code || g.id,
    language: g.language,
    level: source?.level || g.level,
    courseType: source?.courseType || 'group',
    hours: source?.hours || 48,
    teacherId: g.teacher.id,
    teacherName: g.teacher.name,
    textbook: source?.textbook || '',
    studentIds: g.students.map(s => s.id),
    lessonIds: [],
    scheduleIds: [],
    contractIds: [],
    paymentIds: [],
    status: g.status,
    price: g.price,
    maxStudents: g.maxStudents,
    startDate: g.startDate,
    endDate: g.endDate,
    createdAt: g.startDate,
    updatedAt: g.startDate,
  };
}

function _oldToNormTeacher(t: Teacher): NormalizedTeacher {
  return {
    id: t.user.id,
    userId: t.user.id,
    fullName: t.user.name,
    languages: t.languages,
    employmentType: 'full_time',
    groupIds: t.groups.map(g => g.id),
    scheduleItemIds: t.schedule.map(s => s.id),
    vacationIds: t.vacations.map(v => v.id),
    testingSlotIds: [],
    trialLessonSlotIds: [],
    commentIds: [],
    isOnlineOnly: t.isOnlineOnly,
    hourlyRate: t.hourlyRate,
    specializations: t.specializations,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
}

function _oldToNormPayment(p: Payment): NormalizedPayment {
  return {
    id: p.id,
    studentId: p.student.id,
    groupId: p.group?.id,
    amount: p.amount,
    status: p.status as NormalizedPayment['status'],
    method: p.method,
    dueDate: p.dueDate,
    paidDate: p.paidDate,
    description: p.description,
    createdBy: '',
    createdAt: p.dueDate,
    updatedAt: p.dueDate,
  };
}

function _oldToNormLesson(l: Lesson): NormalizedLesson {
  return {
    id: l.id,
    groupId: l.group.id,
    teacherId: l.group.teacher.id,
    date: l.date,
    startTime: l.startTime,
    endTime: l.endTime,
    topic: l.topic,
    status: l.status,
    attendance: l.attendance.map(a => ({
      studentId: a.student.id,
      status: a.present ? 'present' : 'absent',
    })),
    commentIds: [],
    createdAt: l.date,
    updatedAt: l.date,
  };
}

function _oldToNormUser(u: User): NormalizedUser {
  return {
    id: u.id,
    fullName: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    branchIds: [],
    avatar: u.avatar,
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
}

function _oldToNormTask(t: Task): NormalizedTask {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    assigneeId: t.assignee.id,
    status: t.status,
    priority: t.priority,
    deadline: t.dueDate,
    studentId: t.relatedStudent?.id,
    commentIds: [],
    createdBy: t.assignee.id,
    createdAt: t.createdAt,
    updatedAt: t.createdAt,
  };
}

function _oldToNormConversation(c: ChatConversation): NormalizedChatConversation {
  return {
    id: c.id,
    channel: c.channel as NormalizedChatConversation['channel'],
    studentId: c.relatedStudent?.id,
    contactName: c.contactName,
    contactPhones: c.contactPhone ? [c.contactPhone] : [],
    lastMessage: c.lastMessage,
    lastMessageTime: c.lastMessageTime,
    unread: c.unread,
    tags: c.tags,
    notes: c.notes,
    messages: c.messages.map(m => ({
      id: m.id,
      content: m.content,
      sentAt: m.sentAt,
      isFromUs: m.isFromUs,
      status: m.status,
    })),
    createdAt: c.lastMessageTime,
    updatedAt: c.lastMessageTime,
  };
}

function _oldToNormEvent(e: ClubEvent): NormalizedClubEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    capacity: e.capacity,
    registrationIds: e.registrations.map(r => r.id),
    status: e.status,
    language: e.language,
    level: e.level,
    createdAt: e.date,
    updatedAt: e.date,
  };
}

function _oldToNormEventRegistration(r: EventRegistration, eventId: string): NormalizedEventRegistration {
  return {
    id: r.id,
    eventId,
    studentId: r.student.id,
    registeredAt: r.registeredAt,
    attended: r.attended,
  };
}

function _seedStore(): void {
  const store = DataStore.getInstance();

  // 1. Compute group membership for students
  const studentGroupMap = new Map<string, string[]>();
  allGroups.forEach(g => {
    g.students.forEach(s => {
      const groups = studentGroupMap.get(s.id) || [];
      groups.push(g.id);
      studentGroupMap.set(s.id, groups);
    });
  });

  // 2. Convert and import students
  const normStudents = allStudents.map(s => {
    const ns = _oldToNormStudent(s);
    ns.groupIds = studentGroupMap.get(s.id) || [];
    return ns;
  });
  store.importStudents(normStudents);

  // 3. Convert and import groups
  const normGroups = allGroups.map(g => _oldToNormGroup(g));
  store.importGroups(normGroups);

  // 4. Convert and import users
  users.forEach(u => {
    const nu = store.getUser(u.id);
    if (!nu) store.addUser(_oldToNormUser(u));
  });

  // 5. Convert and import teachers
  const normTeachers = allTeachers.map(t => {
    const nt = _oldToNormTeacher(t);
    nt.vacationIds = t.vacations.map(v => v.id);
    return nt;
  });
  store.importTeachers(normTeachers);

  // 6. Import vacations as separate entities
  allTeachers.forEach(t => {
    t.vacations.forEach(v => {
      store.addVacation({
        id: v.id,
        teacherId: t.user.id,
        startDate: v.startDate,
        endDate: v.endDate,
        replacementRequired: false,
        status: v.status as NormalizedVacation['status'],
        commentIds: [],
        createdAt: v.startDate,
        updatedAt: v.startDate,
      } as NormalizedVacation);
    });
  });

  // 8. Import payments
  const normPayments = allPayments.map(p => _oldToNormPayment(p));
  store.importPayments(normPayments);

  // 9. Import lessons
  const normLessons = allLessons.map(l => _oldToNormLesson(l));
  store.importLessons(normLessons);

  // 10. Import tasks
  allTasks.forEach(t => store.addTask(_oldToNormTask(t)));

  // 11. Import conversations
  allConversations.forEach(c => store.addConversation(_oldToNormConversation(c)));

  // 12. Import events + registrations
  allEvents.forEach(e => {
    e.registrations.forEach(r => {
      store.addEventRegistration(_oldToNormEventRegistration(r, e.id));
    });
    store.addEvent(_oldToNormEvent(e));
  });

  // 13. Import permissions
  store.setPermissions(permissions.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    module: p.module,
  })));
  store.setRolePermissions(rolePermissions.map(rp => ({
    role: rp.role,
    permissionIds: rp.permissions,
  })));

  // 14. Import real groups from the parsed data
  realGroups.forEach(rg => {
    const existing = store.getGroup(rg.id);
    if (!existing) {
      store.addGroup({
        id: rg.id,
        name: rg.name,
        code: rg.code,
        language: rg.language,
        level: rg.level,
        courseType: rg.courseType,
        hours: rg.hours,
        teacherId: rg.teacherId || '',
        teacherName: rg.teacherName,
        textbook: rg.textbook,
        studentIds: [],
        lessonIds: [],
        scheduleIds: [],
        contractIds: [],
        paymentIds: [],
        status: rg.status,
        price: rg.price,
        maxStudents: 0,
        startDate: rg.startDate,
        endDate: rg.endDate,
        createdAt: rg.startDate,
        updatedAt: rg.startDate,
      } as NormalizedGroup);
    }
  });

  // 15. Import the fixed anonymized schedule for three consecutive August weeks.
  // One shared seed keeps the schedule, groups, rosters and teacher profiles aligned.
  store.getAllScheduleItems().forEach(item => store.deleteScheduleItem(item.id));
  const teacherNames = new Map(demoTeacherOptions.map(teacher => [teacher.id, teacher.name]));

  demoScheduleAugust2026.forEach(seed => {
    const { date, startTime, endTime, ...item } = seed;
    const [year, month, day] = date.split('-').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const start = new Date(year, month - 1, day, startHour, startMinute);
    const end = new Date(year, month - 1, day, endHour, endMinute);
    const group = item.groupId ? realGroups.find(candidate => candidate.id === item.groupId) : undefined;

    store.addScheduleItem({
      ...item,
      start,
      end,
      teacherName: teacherNames.get(item.teacherId) || item.teacherName,
      courseStartDate: group?.startDate,
      courseEndDate: group?.endDate,
      courseHours: group?.hours,
      coursePrice: group?.price,
      textbook: group?.textbook,
      commentIds: [],
      createdAt: start,
      updatedAt: start,
    });
  });

  demoTeacherOptions.forEach(teacher => {
    store.updateTeacher(teacher.id, {
      scheduleItemIds: store.getAllScheduleItems()
        .filter(item => item.teacherId === teacher.id)
        .map(item => item.id),
    });
  });

  const groupCommentTemplates = [
    'Состав подтверждён. Напомнить студентам об учебнике до следующего занятия.',
    'Один студент просил запись вводной части; согласовать с преподавателем.',
    'Проверить оплату второго учебного блока в конце недели.',
    'Группа идёт в хорошем темпе, переносов на этой неделе не планируется.',
    'Новому участнику отправлены материалы и ссылка на онлайн-комнату.',
    'После середины курса собрать короткую обратную связь по темпу занятий.',
  ];
  realGroups.forEach((group, index) => {
    const createdAt = new Date(2026, 7, 10 + (index % 9), 10 + (index % 7), 20);
    store.addComment({
      id: `comment-group-${String(index + 1).padStart(3, '0')}`,
      entityType: 'group',
      entityId: group.id,
      authorId: index % 2 === 0 ? 'u9' : 'u10',
      text: groupCommentTemplates[index % groupCommentTemplates.length],
      createdAt,
      updatedAt: createdAt,
    });
  });

  console.log(`Store seeded: ${store.countStudents()} students, ${store.countGroups()} groups, ${store.countTeachers()} teachers, ${store.countPayments()} payments, ${store.countLessons()} lessons`);
}

_seedStore();
