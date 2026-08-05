import { DataStore } from './store';
import type {
  Student, Group, Teacher, Payment, Lesson, User, Task, ChatConversation,
  ClubEvent, TeacherScheduleItem, Vacation, ScheduleItem,
  EventRegistration, Club, ClubMember, Lead, Application, TestingEvent,
  FreeSlot, AdminShift, RolePermissions, Permission, ScheduleStatus,
} from '../types';
import type {
  NormalizedStudent, NormalizedGroup, NormalizedTeacher, NormalizedLesson,
  NormalizedPayment, NormalizedUser, NormalizedTeacherScheduleItem,
  NormalizedEventRegistration, NormalizedClubMember, NormalizedVacation,
  NormalizedClubEvent,
} from '../types/normalized';

const store = DataStore.getInstance();

// ============================================================
//  INTERNAL CONVERTERS — Normalized → Old types
// ============================================================

const _userCache = new Map<string, User>();

function _toUser(nu: NormalizedUser): User {
  let old = _userCache.get(nu.id);
  if (!old) {
    old = {
      id: nu.id,
      name: nu.fullName,
      email: nu.email,
      phone: nu.phone,
      role: nu.role,
      avatar: nu.avatar,
    };
    _userCache.set(nu.id, old);
  }
  return old;
}

function _resolveUser(userId: string | undefined): User | undefined {
  if (!userId) return undefined;
  const nu = store.getUser(userId);
  return nu ? _toUser(nu) : undefined;
}

function _toStudent(ns: NormalizedStudent): Student {
  const groupIds = ns.groupIds;
  const groups = groupIds.map(gid => store.getGroup(gid)).filter(Boolean) as NormalizedGroup[];
  const currentGroup = groups.length > 0
    ? _toGroup(groups[0], true)
    : undefined;

  return {
    id: ns.id,
    name: ns.fullName,
    phone: ns.phones[0] || '',
    email: ns.emails[0] || '',
    currentLevel: ns.level as Student['currentLevel'],
    language: ns.language,
    currentGroup,
    status: ns.status,
    paymentStatus: 'pending',
    joinDate: ns.createdAt,
    balance: 0,
    notes: ns.notes.join('; '),
  };
}

function _toGroup(ng: NormalizedGroup, shallow?: boolean): Group {
  const students: Student[] = shallow
    ? []
    : ng.studentIds.map(sid => {
        const ns = store.getStudent(sid);
        return ns ? _toStudent(ns) : undefined;
      }).filter(Boolean) as Student[];

  const teacher = _resolveUser(ng.teacherId) || { id: '', name: '', email: '', phone: '', role: 'teacher' as const };
  const schedule: ScheduleItem[] = [];

  return {
    id: ng.id,
    name: ng.name,
    language: ng.language,
    level: ng.level as Group['level'],
    teacher,
    schedule,
    startDate: ng.startDate,
    endDate: ng.endDate,
    status: ng.status,
    students,
    maxStudents: ng.maxStudents,
    price: ng.price,
  };
}

function _toPayment(np: NormalizedPayment): Payment {
  const ns = store.getStudent(np.studentId);
  const student = ns ? _toStudent(ns) : { id: '', name: '', phone: '', email: '', currentLevel: 'A1' as const, language: 'German' as const, status: 'active' as const, paymentStatus: 'pending' as const, joinDate: new Date(), balance: 0, notes: '' };

  let group: Group | undefined;
  if (np.groupId) {
    const ng = store.getGroup(np.groupId);
    if (ng) group = _toGroup(ng, true);
  }

  return {
    id: np.id,
    student,
    amount: np.amount,
    dueDate: np.dueDate,
    paidDate: np.paidDate,
    status: np.status as Payment['status'],
    method: np.method,
    description: np.description,
    group,
  };
}

function _toLesson(nl: NormalizedLesson): Lesson {
  const ng = store.getGroup(nl.groupId);
  const group = ng ? _toGroup(ng, true) : { id: '', name: '', language: 'German' as const, level: 'A1' as const, teacher: { id: '', name: '', email: '', phone: '', role: 'teacher' as const }, schedule: [], startDate: new Date(), status: 'active' as const, students: [], maxStudents: 0, price: 0 };

  const attendance: { student: Student; present: boolean }[] = nl.attendance.map(a => {
    const ns = store.getStudent(a.studentId);
    const st = ns ? _toStudent(ns) : { id: a.studentId, name: '', phone: '', email: '', currentLevel: 'A1' as const, language: 'German' as const, status: 'active' as const, paymentStatus: 'pending' as const, joinDate: new Date(), balance: 0, notes: '' };
    return { student: st, present: a.status === 'present' };
  });

  return {
    id: nl.id,
    group,
    date: nl.date,
    startTime: nl.startTime,
    endTime: nl.endTime,
    topic: nl.topic,
    status: nl.status,
    attendance,
    classroom: nl.roomId ? store.getRoom(nl.roomId)?.name : undefined,
    zoomRoom: undefined,
  };
}

function _toTeacher(nt: NormalizedTeacher): Teacher {
  const user = _resolveUser(nt.userId) || { id: '', name: '', email: '', phone: '', role: 'teacher' as const };
  const teacherGroups: Group[] = nt.groupIds
    .map(gid => store.getGroup(gid))
    .filter(Boolean)
    .map(ng => _toGroup(ng as NormalizedGroup, true));

  const scheduleItems: TeacherScheduleItem[] = nt.scheduleItemIds
    .map(sid => store.getScheduleItem(sid))
    .filter(Boolean)
    .map(nsi => _toScheduleItem(nsi as NormalizedTeacherScheduleItem));

  const vacations: Vacation[] = nt.vacationIds
    .map(vid => store.getVacation(vid))
    .filter(Boolean)
    .map(nv => _toVacation(nv as NormalizedVacation));

  return {
    user,
    languages: nt.languages,
    specializations: nt.specializations,
    hourlyRate: nt.hourlyRate,
    groups: teacherGroups,
    schedule: scheduleItems,
    vacations,
    statistics: {
      totalStudents: teacherGroups.reduce((sum, g) => sum + g.students.length, 0),
      activeGroups: teacherGroups.filter(g => g.status === 'active').length,
      completedLessons: 0,
      averageRating: 4.5,
      totalHours: 0,
    },
    isOnlineOnly: nt.isOnlineOnly,
  };
}

function _toScheduleItem(nsi: NormalizedTeacherScheduleItem): TeacherScheduleItem {
  let group: Group | undefined;
  if (nsi.groupId) {
    const ng = store.getGroup(nsi.groupId);
    if (ng) group = _toGroup(ng, true);
  }

  return {
    id: nsi.id,
    teacherId: nsi.teacherId,
    date: nsi.start,
    startTime: nsi.start.toTimeString().slice(0, 5),
    endTime: nsi.end.toTimeString().slice(0, 5),
    type: nsi.lessonType as TeacherScheduleItem['type'],
    status: nsi.status as ScheduleStatus,
    group,
    classroom: nsi.roomId ? store.getRoom(nsi.roomId)?.name : undefined,
    zoomRoom: undefined,
    studentId: nsi.studentId,
  };
}

function _toVacation(nv: NormalizedVacation): Vacation {
  return {
    id: nv.id,
    startDate: nv.startDate,
    endDate: nv.endDate,
    type: 'vacation',
    status: nv.status as Vacation['status'],
  };
}

function _toEvent(ne: NormalizedClubEvent): ClubEvent {
  const registrations: EventRegistration[] = ne.registrationIds
    .map(rid => store.getEventRegistration(rid))
    .filter(Boolean)
    .map(nreg => {
      const ns = store.getStudent((nreg as NormalizedEventRegistration).studentId);
      const st = ns ? _toStudent(ns) : { id: '', name: '', phone: '', email: '', currentLevel: 'A1' as const, language: 'German' as const, status: 'active' as const, paymentStatus: 'pending' as const, joinDate: new Date(), balance: 0, notes: '' };
      return {
        id: (nreg as NormalizedEventRegistration).id,
        student: st,
        registeredAt: (nreg as NormalizedEventRegistration).registeredAt,
        attended: (nreg as NormalizedEventRegistration).attended,
      };
    });

  return {
    id: ne.id,
    title: ne.title,
    description: ne.description,
    date: ne.date,
    startTime: ne.startTime,
    endTime: ne.endTime,
    location: ne.roomId ? store.getRoom(ne.roomId)?.name || '' : '',
    capacity: ne.capacity,
    registrations,
    status: ne.status,
    language: ne.language,
    level: ne.level as ClubEvent['level'],
  };
}

// ============================================================
//  STUDENT SELECTORS
// ============================================================

export function getStudent(id: string): Student | undefined {
  const ns = store.getStudent(id);
  return ns ? _toStudent(ns) : undefined;
}

export function getAllStudents(): Student[] {
  return store.getAllStudents().map(_toStudent);
}

export function getGroupStudents(groupId: string): Student[] {
  return store.getGroupStudents(groupId).map(_toStudent);
}

export function getStudentGroups(studentId: string): Group[] {
  return store.getStudentGroups(studentId).map(ng => _toGroup(ng, true));
}

export function getActiveStudents(): Student[] {
  return store.getAllStudents().filter(s => s.status === 'active').map(_toStudent);
}

export function getStudentsByLevel(level: string): Student[] {
  return store.getAllStudents().filter(s => s.level === level).map(_toStudent);
}

export function countStudents(): number {
  return store.countStudents();
}

// ============================================================
//  GROUP SELECTORS
// ============================================================

export function getGroup(id: string): Group | undefined {
  const ng = store.getGroup(id);
  return ng ? _toGroup(ng, false) : undefined;
}

export function getAllGroups(): Group[] {
  return store.getAllGroups().map(ng => _toGroup(ng, true));
}

export function getTeacherGroups(teacherId: string): Group[] {
  return store.getTeacherGroups(teacherId).map(ng => _toGroup(ng, true));
}

export function getActiveGroups(): Group[] {
  return store.getAllGroups().filter(g => g.status === 'active').map(ng => _toGroup(ng, true));
}

export function getGroupsByLevel(level: string): Group[] {
  return store.getAllGroups().filter(g => g.level === level).map(ng => _toGroup(ng, true));
}

export function countGroups(): number {
  return store.countGroups();
}

// ============================================================
//  TEACHER SELECTORS
// ============================================================

export function getTeacher(id: string): Teacher | undefined {
  const nt = store.getTeacher(id);
  return nt ? _toTeacher(nt) : undefined;
}

export function getAllTeachers(): Teacher[] {
  return store.getAllTeachers().map(_toTeacher);
}

export function getTeacherByUserId(userId: string): Teacher | undefined {
  const nt = store.findTeacher(t => t.userId === userId);
  return nt ? _toTeacher(nt) : undefined;
}

export function countTeachers(): number {
  return store.countTeachers();
}

// ============================================================
//  PAYMENT SELECTORS
// ============================================================

export function getPayment(id: string): Payment | undefined {
  const np = store.getPayment(id);
  return np ? _toPayment(np) : undefined;
}

export function getAllPayments(): Payment[] {
  return store.getAllPayments().map(_toPayment);
}

export function getStudentPayments(studentId: string): Payment[] {
  return store.getStudentPayments(studentId).map(_toPayment);
}

export function getGroupPayments(groupId: string): Payment[] {
  return store.getAllPayments().filter(p => p.groupId === groupId).map(_toPayment);
}

export function countPayments(): number {
  return store.countPayments();
}

// ============================================================
//  LESSON SELECTORS
// ============================================================

export function getLesson(id: string): Lesson | undefined {
  const nl = store.getLesson(id);
  return nl ? _toLesson(nl) : undefined;
}

export function getAllLessons(): Lesson[] {
  return store.getAllLessons().map(_toLesson);
}

export function getGroupLessons(groupId: string): Lesson[] {
  return store.getGroupLessons(groupId).map(_toLesson);
}

export function getStudentLessons(studentId: string): Lesson[] {
  return store.getAllLessons().filter(l =>
    l.attendance.some(a => a.studentId === studentId)
  ).map(_toLesson);
}

export function countLessons(): number {
  return store.countLessons();
}

// ============================================================
//  USER SELECTORS
// ============================================================

export function getUser(id: string): User | undefined {
  const nu = store.getUser(id);
  return nu ? _toUser(nu) : undefined;
}

export function getAllUsers(): User[] {
  return store.getAllUsers().map(_toUser);
}

export function getTeachersAsUsers(): User[] {
  return store.getAllUsers().filter(u => u.role === 'teacher').map(_toUser);
}

export function getManagers(): User[] {
  return store.getAllUsers().filter(u => u.role === 'manager' || u.role === 'director' || u.role === 'deputy_director').map(_toUser);
}

// ============================================================
//  TASK SELECTORS
// ============================================================

export function getTask(id: string): Task | undefined {
  const nt = store.getTask(id);
  if (!nt) return undefined;
  const assignee = _resolveUser(nt.assigneeId) || { id: '', name: '', email: '', phone: '', role: 'manager' as const };
  let relatedStudent: Student | undefined;
  if (nt.studentId) {
    const ns = store.getStudent(nt.studentId);
    if (ns) relatedStudent = _toStudent(ns);
  }
  return {
    id: nt.id,
    title: nt.title,
    description: nt.description,
    status: nt.status,
    assignee,
    dueDate: nt.deadline || nt.createdAt,
    priority: nt.priority,
    createdAt: nt.createdAt,
    relatedStudent,
  };
}

export function getAllTasks(): Task[] {
  return store.getAllTasks().map(t => getTask(t.id)).filter(Boolean) as Task[];
}

// ============================================================
//  CHAT / CONVERSATION SELECTORS
// ============================================================

export function getConversation(id: string): ChatConversation | undefined {
  const nc = store.getConversation(id);
  if (!nc) return undefined;
  let relatedStudent: Student | undefined;
  if (nc.studentId) {
    const ns = store.getStudent(nc.studentId);
    if (ns) relatedStudent = _toStudent(ns);
  }
  return {
    id: nc.id,
    channel: nc.channel as ChatConversation['channel'],
    contactName: nc.contactName,
    contactPhone: nc.contactPhones[0],
    lastMessage: nc.lastMessage,
    lastMessageTime: nc.lastMessageTime,
    unread: nc.unread,
    avatar: undefined,
    tags: nc.tags,
    notes: nc.notes,
    messages: nc.messages.map(m => ({
      id: m.id,
      content: m.content,
      sentAt: m.sentAt,
      isFromUs: m.isFromUs,
      status: m.status,
    })),
    relatedStudent,
  };
}

export function getAllConversations(): ChatConversation[] {
  return store.getAllConversations().map(c => getConversation(c.id)).filter(Boolean) as ChatConversation[];
}

// ============================================================
//  EVENT SELECTORS
// ============================================================

export function getEvent(id: string): ClubEvent | undefined {
  const ne = store.getEvent(id);
  return ne ? _toEvent(ne) : undefined;
}

export function getAllEvents(): ClubEvent[] {
  return store.getAllEvents().map(_toEvent);
}

// ============================================================
//  SCHEDULE SELECTORS
// ============================================================

export function getAllScheduleItems(): TeacherScheduleItem[] {
  return store.getAllScheduleItems().map(_toScheduleItem);
}

export function getTeacherSchedule(teacherId: string): TeacherScheduleItem[] {
  return store.getTeacherScheduleItems(teacherId).map(_toScheduleItem);
}

export function getStudentSchedule(studentId: string): TeacherScheduleItem[] {
  return store.getAllScheduleItems()
    .filter(s => s.studentId === studentId || (s.groupId && store.getGroupStudents(s.groupId).some(st => st.id === studentId)))
    .map(_toScheduleItem);
}

// ============================================================
//  CLUB SELECTORS
// ============================================================

export function getAllClubs(): Club[] {
  return store.getAllClubs().map(nc => {
    const members: ClubMember[] = nc.memberIds
      .map(mid => store.getClubMember(mid))
      .filter(Boolean)
      .map(nm => {
        const ns = store.getStudent((nm as NormalizedClubMember).studentId);
        const st = ns ? _toStudent(ns) : { id: '', name: '', phone: '', email: '', currentLevel: 'A1' as const, language: 'German' as const, status: 'active' as const, paymentStatus: 'pending' as const, joinDate: new Date(), balance: 0, notes: '' };
        return {
          id: (nm as NormalizedClubMember).id,
          student: st,
          paymentType: (nm as NormalizedClubMember).paymentType,
          lessonsRemaining: (nm as NormalizedClubMember).lessonsRemaining,
          joinedAt: (nm as NormalizedClubMember).joinedAt,
        };
      });
    return {
      id: nc.id,
      name: nc.name,
      description: nc.description,
      language: nc.language,
      level: nc.level as Club['level'],
      format: nc.format,
      schedule: [],
      members,
      status: nc.status,
    };
  });
}

// ============================================================
//  LEAD SELECTORS
// ============================================================

export function getAllLeads(): Lead[] {
  return store.getAllLeads().map(nl => {
    const manager = _resolveUser(nl.assignedManagerId) || { id: '', name: '', email: '', phone: '', role: 'manager' as const };
    return {
      id: nl.id,
      name: nl.fullName,
      phone: nl.phones[0] || '',
      email: nl.emails[0] || '',
      source: nl.source as Lead['source'],
      language: nl.language,
      status: nl.status as Lead['status'],
      notes: nl.notes,
      assignedManager: manager,
      createdAt: nl.createdAt,
      updatedAt: nl.updatedAt,
      activityHistory: [],
    };
  });
}

// ============================================================
//  APPLICATION SELECTORS
// ============================================================

export function getAllApplications(): Application[] {
  return store.getAllApplications().map(na => {
    const manager = na.assignedManagerId ? _resolveUser(na.assignedManagerId) : undefined;
    return {
      id: na.id,
      name: na.fullName,
      phone: na.phones[0] || '',
      email: na.emails[0],
      source: na.source as Application['source'],
      status: na.status as Application['status'],
      comment: na.comment,
      assignedManager: manager,
      isNewClient: !na.relatedStudentId,
      relatedStudentId: na.relatedStudentId,
      createdAt: na.createdAt,
      updatedAt: na.updatedAt,
      history: [],
    };
  });
}

// ============================================================
//  TESTING / TRIAL SELECTORS
// ============================================================

export function getAllTestingEvents(): TestingEvent[] {
  return store.getAllTestingEvents().map(nte => {
    let student: Student | undefined;
    if (nte.studentId) {
      const ns = store.getStudent(nte.studentId);
      if (ns) student = _toStudent(ns);
    }
    return {
      id: nte.id,
      teacherId: nte.teacherId,
      date: nte.date,
      startTime: nte.startTime,
      endTime: nte.endTime,
      type: nte.type as TestingEvent['type'],
      student,
      status: nte.status as TestingEvent['status'],
      language: nte.language,
      format: nte.format,
      classroom: nte.roomId ? store.getRoom(nte.roomId)?.name : undefined,
      zoomRoom: undefined,
    };
  });
}

// ============================================================
//  FREE SLOT SELECTORS
// ============================================================

export function getAllFreeSlots(): FreeSlot[] {
  return store.getAllFreeSlots().map(nfs => ({
    id: nfs.id,
    teacherId: nfs.teacherId,
    date: nfs.date,
    startTime: nfs.startTime,
    endTime: nfs.endTime,
    booked: nfs.booked,
    bookingType: nfs.bookingType,
    bookingId: nfs.bookingId,
  }));
}

// ============================================================
//  ADMIN SHIFT SELECTORS
// ============================================================

export function getAllAdminShifts(): AdminShift[] {
  return store.getAllAdminShifts().map(nas => {
    const admin = _resolveUser(nas.adminId) || { id: '', name: '', email: '', phone: '', role: 'administrator' as const };
    const replacement = nas.replacementId ? _resolveUser(nas.replacementId) : undefined;
    return {
      id: nas.id,
      admin,
      date: nas.date,
      startTime: nas.startTime,
      endTime: nas.endTime,
      hours: nas.hours,
      status: nas.status as AdminShift['status'],
      isVacation: nas.isVacation,
      replacement,
    };
  });
}

// ============================================================
//  PERMISSION SELECTORS
// ============================================================

export function getAllPermissions(): Permission[] {
  return store.getAllPermissions().map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    module: p.module,
  }));
}

export function getAllRolePermissions(): RolePermissions[] {
  return store.getAllRolePermissions().map(rp => ({
    role: rp.role as RolePermissions['role'],
    permissions: rp.permissionIds,
  }));
}
