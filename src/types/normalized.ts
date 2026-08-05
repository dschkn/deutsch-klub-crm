// ============================================================
// NORMALIZED DATA MODEL — Single Source of Truth
// No embedded objects — only ID references.
// ============================================================

// --- Core Entities ---

export interface NormalizedStudent {
  id: string;
  fullName: string;
  phones: string[];
  emails: string[];
  language: 'German' | 'English';
  level: string;
  status: 'active' | 'inactive' | 'graduated' | 'frozen';
  groupIds: string[];
  contractIds: string[];
  paymentIds: string[];
  lessonIds: string[];
  taskIds: string[];
  chatIds: string[];
  testingIds: string[];
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedGroup {
  id: string;
  name: string;
  code: string;
  language: 'German' | 'English';
  level: string;
  courseType: string;
  hours: number;
  teacherId: string;
  teacherName: string;
  textbook: string;
  studentIds: string[];
  lessonIds: string[];
  scheduleIds: string[];
  contractIds: string[];
  paymentIds: string[];
  roomId?: string;
  zoomRoomId?: string;
  status: 'active' | 'completed' | 'planned';
  price: number;
  maxStudents: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedScheduleEntry {
  id: string;
  groupId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  zoomRoom?: string;
}

export interface NormalizedTeacher {
  id: string;
  userId: string;
  fullName: string;
  languages: ('German' | 'English')[];
  employmentType: 'full_time' | 'part_time' | 'hourly';
  groupIds: string[];
  scheduleItemIds: string[];
  vacationIds: string[];
  testingSlotIds: string[];
  trialLessonSlotIds: string[];
  commentIds: string[];
  isOnlineOnly?: boolean;
  hourlyRate: number;
  specializations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedLesson {
  id: string;
  groupId: string;
  teacherId: string;
  roomId?: string;
  zoomRoomId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  topic: string;
  attendance: NormalizedAttendance[];
  commentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedAttendance {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  homeworkStatus?: 'done' | 'partial' | 'not_done';
  comment?: string;
}

export interface NormalizedPayment {
  id: string;
  studentId: string;
  groupId?: string;
  contractId?: string;
  invoiceId?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  method?: 'cash' | 'card' | 'transfer' | 'online';
  dueDate: Date;
  paidDate?: Date;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedContract {
  id: string;
  studentId: string;
  groupId?: string;
  paymentIds: string[];
  status: 'draft' | 'signed' | 'active' | 'completed' | 'terminated';
  signedDate?: Date;
  startDate: Date;
  endDate?: Date;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedTeacherScheduleItem {
  id: string;
  teacherId: string;
  groupId?: string;
  studentId?: string;
  lessonType: 'lesson' | 'preparation' | 'meeting' | 'break' | 'individual' | 'testing' | 'trial' | 'club' | 'intensive' | 'grammar' | 'mini' | 'phonetics' | 'open_lesson' | 'language_course';
  roomId?: string;
  zoomRoomId?: string;
  start: Date;
  end: Date;
  repeatRule?: NormalizedRecurrenceRule;
  status: string;
  previousStatus?: string;
  commentIds: string[];
  createdAt: Date;
  updatedAt: Date;
  // Card display fields (self-contained, no group lookup needed)
  groupName?: string;
  groupLevel?: string;
  groupLanguage?: string;
  courseType?: string;
  format?: 'online' | 'offline' | 'hybrid';
  teacherName?: string;
  classroomName?: string;
  studentName?: string;
  capacity?: number;
  currentStudents?: number;
}

export interface NormalizedRecurrenceRule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom' | 'none';
  interval: number;
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[];
}

export interface NormalizedTask {
  id: string;
  title: string;
  description: string;
  studentId?: string;
  groupId?: string;
  assigneeId: string;
  status: 'new' | 'in_progress' | 'waiting' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  commentIds: string[];
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Communication ---

export interface NormalizedChatConversation {
  id: string;
  channel: 'telegram' | 'whatsapp' | 'vk' | 'email';
  studentId?: string;
  contactName: string;
  contactPhones: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  tags: string[];
  notes: string;
  messages: NormalizedChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedChatMessage {
  id: string;
  content: string;
  sentAt: Date;
  isFromUs: boolean;
  status: 'sent' | 'delivered' | 'read';
}

// --- Events & Clubs ---

export interface NormalizedClubEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  roomId?: string;
  zoomRoomId?: string;
  capacity: number;
  registrationIds: string[];
  status: 'planned' | 'registration_open' | 'full' | 'completed' | 'cancelled';
  language?: 'German' | 'English';
  level?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedEventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  registeredAt: Date;
  attended: boolean;
}

export interface NormalizedClub {
  id: string;
  name: string;
  description?: string;
  language: 'German' | 'English';
  level?: string;
  format: 'online' | 'offline';
  roomId?: string;
  zoomRoomId?: string;
  memberIds: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedClubMember {
  id: string;
  clubId: string;
  studentId: string;
  paymentType: 'subscription' | 'single' | 'trial';
  lessonsRemaining: number;
  joinedAt: Date;
}

// --- Testing & Trials ---

export interface NormalizedTestingEvent {
  id: string;
  studentId?: string;
  teacherId: string;
  type: 'testing' | 'trial';
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  language: 'German' | 'English';
  format: 'online' | 'offline';
  roomId?: string;
  zoomRoomId?: string;
  commentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Schedule & Free Slots ---

export interface NormalizedFreeSlot {
  id: string;
  teacherId: string;
  date: Date;
  startTime: string;
  endTime: string;
  booked: boolean;
  bookingType?: 'testing' | 'trial';
  bookingId?: string;
}

// --- Directories ---

export interface NormalizedRoom {
  id: string;
  name: string;
  type: 'office' | 'classroom' | 'zoom';
  capacity: number;
  branchId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  rooms: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// --- Comments (universal) ---

export interface NormalizedComment {
  id: string;
  entityType: 'teacher' | 'group' | 'lesson' | 'student' | 'testing' | 'task' | 'payment';
  entityId: string;
  authorId: string;
  text: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// --- HR ---

export interface NormalizedVacation {
  id: string;
  teacherId: string;
  startDate: Date;
  endDate: Date;
  replacementRequired: boolean;
  replacementTeacherId?: string;
  commentIds: string[];
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedAdminShift {
  id: string;
  adminId: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  isVacation?: boolean;
  replacementId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Users & Permissions ---

export interface NormalizedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'director' | 'deputy_director' | 'manager' | 'teacher' | 'administrator';
  branchIds: string[];
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedPermission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface NormalizedRolePermission {
  role: string;
  permissionIds: string[];
}

// --- Lead / Application ---

export interface NormalizedLead {
  id: string;
  fullName: string;
  phones: string[];
  emails: string[];
  source: string;
  language: 'German' | 'English';
  status: string;
  notes: string;
  assignedManagerId: string;
  convertedToStudentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedApplication {
  id: string;
  fullName: string;
  phones: string[];
  emails: string[];
  source: string;
  status: string;
  comment?: string;
  assignedManagerId?: string;
  relatedStudentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// --- Infrastructure (future-ready) ---

export interface NormalizedInvoice {
  id: string;
  contractId: string;
  studentId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  items: NormalizedInvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface NormalizedAttachment {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface NormalizedAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  changes: Record<string, { old: unknown; new: unknown }>;
  performedBy: string;
  createdAt: Date;
}

export interface NormalizedNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NormalizedIntegration {
  id: string;
  name: string;
  provider: string;
  config: Record<string, string>;
  isEnabled: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NormalizedImportJob {
  id: string;
  type: 'students' | 'groups' | 'teachers' | 'payments' | 'lessons';
  source: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  importedRows: number;
  errorRows: number;
  errors: string[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface NormalizedExportJob {
  id: string;
  type: 'students' | 'groups' | 'teachers' | 'payments' | 'lessons' | 'reports';
  format: 'csv' | 'xlsx' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filters: Record<string, unknown>;
  fileUrl?: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

// --- Utility ---

export type NormalizedEntity =
  | NormalizedStudent
  | NormalizedGroup
  | NormalizedTeacher
  | NormalizedLesson
  | NormalizedPayment
  | NormalizedContract
  | NormalizedTeacherScheduleItem
  | NormalizedTask
  | NormalizedChatConversation
  | NormalizedClubEvent
  | NormalizedClub
  | NormalizedTestingEvent
  | NormalizedVacation
  | NormalizedAdminShift
  | NormalizedUser
  | NormalizedComment
  | NormalizedRoom
  | NormalizedBranch;
