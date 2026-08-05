export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'director' | 'deputy_director' | 'manager' | 'teacher' | 'administrator';
  avatar?: string;
  isOnlineOnly?: boolean;
}

// Заявка - новый тип
export interface Application {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'vk' | 'whatsapp' | 'telegram' | 'instagram' | 'website' | 'mango_office';
  status: 'new' | 'in_progress' | 'contacted' | 'trial_lesson' | 'enrolled' | 'rejected';
  comment?: string;
  assignedManager?: User;
  isNewClient: boolean;
  relatedStudentId?: string;
  createdAt: Date;
  updatedAt: Date;
  history: ApplicationHistoryItem[];
}

export interface ApplicationHistoryItem {
  id: string;
  type: 'status_change' | 'comment' | 'call' | 'note';
  content: string;
  user: User;
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: 'website' | 'instagram' | 'facebook' | 'referral' | 'google' | 'walk_in' | 'vk';
  language: 'German' | 'English';
  status: 'new' | 'contacted' | 'trial_lesson' | 'interested' | 'student' | 'lost';
  notes: string;
  assignedManager: User;
  createdAt: Date;
  updatedAt: Date;
  activityHistory: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'message';
  description: string;
  createdAt: Date;
  user: User;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  language: 'German' | 'English';
  currentGroup?: Group;
  status: 'active' | 'inactive' | 'graduated' | 'frozen';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  joinDate: Date;
  balance: number;
  avatar?: string;
  notes: string;
  // Новые поля для карточки клиента
  birthDate?: Date;
  profession?: string;
  howDidYouKnow?: string;
  discounts?: string;
  days?: string[];
  times?: string[];
  format?: 'online' | 'offline';
  isFriendForFriend?: boolean;
  englishLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  germanLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  communications?: CommunicationItem[];
}

// Коммуникации клиента
export interface CommunicationItem {
  id: string;
  type: 'telegram' | 'whatsapp' | 'vk' | 'call' | 'note' | 'application';
  content: string;
  direction?: 'incoming' | 'outgoing';
  createdAt: Date;
  user?: User;
}

export interface Group {
  id: string;
  name: string;
  language: 'German' | 'English';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  teacher: User;
  schedule: ScheduleItem[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'planned';
  students: Student[];
  maxStudents: number;
  price: number;
}

export interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  zoomRoom?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'waiting' | 'completed';
  assignee: User;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  relatedStudent?: Student;
  relatedLead?: Lead;
}

export interface ChatConversation {
  id: string;
  channel: 'telegram' | 'whatsapp' | 'vk';
  contactName: string;
  contactPhone?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  avatar?: string;
  tags: string[];
  notes: string;
  messages: ChatMessage[];
  relatedStudent?: Student;
}

export interface ChatMessage {
  id: string;
  content: string;
  sentAt: Date;
  isFromUs: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface Teacher {
  user: User;
  languages: ('German' | 'English')[];
  specializations: string[];
  hourlyRate: number;
  groups: Group[];
  schedule: TeacherScheduleItem[];
  vacations: Vacation[];
  statistics: TeacherStatistics;
  isOnlineOnly?: boolean;
  weeklyNote?: string;
}

export type ScheduleStatus =
  | 'trial_lesson'        // Тестовое занятие — светло-голубой
  | 'group_start'         // Старт группы — красный
  | 'needs_replacement'   // Нужна замена — светло-желтый
  | 'replacement'         // Заменяющий — розово-фиолетовый
  | 'vacation'            // Отпуск — бирюзовый
  | 'last_lesson'         // Последнее занятие — ярко-желтый
  | 'unpaid'              // Индив. не оплачено — светло-бежевый
  | 'confirmed_paid'      // Индив. подтверждено и оплачено — светло-зеленый
  | 'needs_attention'     // Индив. требует внимания — ярко-зеленый
  | 'recruiting'          // Группа в наборе — красный текст
  | 'cancelled'           // Группа не стартует/перенос — красный зачёркнутый
  | 'unavailable';        // Преп. не может — светло-серый

export interface TeacherScheduleItem {
  id: string;
  teacherId?: string;
  groupId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'lesson' | 'preparation' | 'meeting' | 'break' | 'individual' | 'testing' | 'trial' | 'club' | 'intensive' | 'grammar' | 'mini' | 'phonetics' | 'open_lesson' | 'language_course';
  status: ScheduleStatus;
  group?: Group;
  classroom?: string;
  zoomRoom?: string;
  format?: 'online' | 'offline';
  comment?: string;
  recurrenceRule?: RecurrenceRule;
  recurrenceId?: string;
  originalDate?: Date;
  replacementTeacherId?: string;
  previousStatus?: ScheduleStatus;
  studentId?: string;
  studentName?: string;
  paymentType?: 'single' | 'package';
  packageSize?: number;
  completedCount?: number;
  // Self-contained display fields (no group lookup needed)
  groupName?: string;
  groupLevel?: string;
  groupLanguage?: string;
  courseType?: string;
  teacherName?: string;
  capacity?: number;
  currentStudents?: number;
}

export interface RecurrenceRule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom' | 'none';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[];
}

export interface CellComment {
  id: string;
  weekStart: string; // ISO date string of week start (Monday)
  teacherId: string;
  dayIndex: number; // 0-6 (Mon-Sun)
  slotIndex: number; // time slot index
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherComment {
  id: string;
  teacherId: string;
  weekStart: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: TeacherCommentReply[];
}

export interface TeacherCommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: Date;
}

export interface Vacation {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'vacation' | 'sick_leave' | 'personal';
  status: 'approved' | 'pending' | 'rejected';
}

export interface TeacherStatistics {
  totalStudents: number;
  activeGroups: number;
  completedLessons: number;
  averageRating: number;
  totalHours: number;
}

export interface Payment {
  id: string;
  student: Student;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'paid' | 'pending' | 'overdue';
  method?: 'cash' | 'card' | 'transfer' | 'online';
  description: string;
  group?: Group;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registrations: EventRegistration[];
  status: 'planned' | 'registration_open' | 'full' | 'completed' | 'cancelled';
  language?: 'German' | 'English';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
}

export interface EventRegistration {
  id: string;
  student: Student;
  registeredAt: Date;
  attended: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface RolePermissions {
  role: 'director' | 'deputy_director' | 'manager' | 'teacher' | 'administrator';
  permissions: string[];
}

export interface Lesson {
  id: string;
  group: Group;
  date: Date;
  startTime: string;
  endTime: string;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendance: { student: Student; present: boolean }[];
  classroom?: string;
  zoomRoom?: string;
}

// Клуб
export interface Club {
  id: string;
  name: string;
  description?: string;
  language: 'German' | 'English';
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  format: 'online' | 'offline';
  schedule: ScheduleItem[];
  members: ClubMember[];
  status: 'active' | 'inactive';
}

export interface ClubMember {
  id: string;
  student: Student;
  paymentType: 'subscription' | 'single' | 'trial';
  lessonsRemaining: number;
  joinedAt: Date;
}

export interface FreeSlot {
  id: string;
  teacherId: string;
  date: Date;
  startTime: string;
  endTime: string;
  booked: boolean;
  bookingType?: 'testing' | 'trial';
  bookingId?: string;
}

export interface TestingEvent {
  id: string;
  teacherId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'testing' | 'trial';
  student?: Student;
  status: 'scheduled' | 'completed' | 'cancelled';
  language: 'German' | 'English';
  format: 'online' | 'offline';
  classroom?: string;
  zoomRoom?: string;
  comment?: string;
  recurrenceRule?: RecurrenceRule;
  recurrenceId?: string;
}

// Смена администратора
export interface AdminShift {
  id: string;
  admin: User;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  isVacation?: boolean;
  replacement?: User;
}
