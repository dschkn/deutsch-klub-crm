import type {
  NormalizedStudent,
  NormalizedGroup,
  NormalizedTeacher,
  NormalizedLesson,
  NormalizedPayment,
  NormalizedContract,
  NormalizedTeacherScheduleItem,
  NormalizedTask,
  NormalizedChatConversation,
  NormalizedClubEvent,
  NormalizedEventRegistration,
  NormalizedClub,
  NormalizedClubMember,
  NormalizedTestingEvent,
  NormalizedFreeSlot,
  NormalizedVacation,
  NormalizedAdminShift,
  NormalizedUser,
  NormalizedPermission,
  NormalizedRolePermission,
  NormalizedLead,
  NormalizedApplication,
  NormalizedComment,
  NormalizedRoom,
  NormalizedBranch,
  NormalizedInvoice,
  NormalizedAttachment,
  NormalizedAuditLog,
  NormalizedNotification,
  NormalizedIntegration,
  NormalizedImportJob,
  NormalizedExportJob,
} from '../types/normalized';

type Listener = () => void;

// ============================================================
// DataStore — Single Source of Truth
// All entities stored normalized (by ID), no embedded objects.
// ============================================================

export class DataStore {
  private static instance: DataStore;

  // --- Core entities ---
  private _students = new Map<string, NormalizedStudent>();
  private _groups = new Map<string, NormalizedGroup>();
  private _teachers = new Map<string, NormalizedTeacher>();
  private _lessons = new Map<string, NormalizedLesson>();
  private _payments = new Map<string, NormalizedPayment>();
  private _contracts = new Map<string, NormalizedContract>();
  private _scheduleItems = new Map<string, NormalizedTeacherScheduleItem>();
  private _tasks = new Map<string, NormalizedTask>();
  private _conversations = new Map<string, NormalizedChatConversation>();
  private _events = new Map<string, NormalizedClubEvent>();
  private _eventRegistrations = new Map<string, NormalizedEventRegistration>();
  private _clubs = new Map<string, NormalizedClub>();
  private _clubMembers = new Map<string, NormalizedClubMember>();
  private _testingEvents = new Map<string, NormalizedTestingEvent>();
  private _freeSlots = new Map<string, NormalizedFreeSlot>();
  private _vacations = new Map<string, NormalizedVacation>();
  private _adminShifts = new Map<string, NormalizedAdminShift>();

  // --- Users & auth ---
  private _users = new Map<string, NormalizedUser>();
  private _permissions = new Map<string, NormalizedPermission>();
  private _rolePermissions = new Map<string, NormalizedRolePermission>();

  // --- Leads & applications ---
  private _leads = new Map<string, NormalizedLead>();
  private _applications = new Map<string, NormalizedApplication>();

  // --- Directories ---
  private _rooms = new Map<string, NormalizedRoom>();
  private _branches = new Map<string, NormalizedBranch>();

  // --- Universal comment system ---
  private _comments = new Map<string, NormalizedComment>();

  // --- Infrastructure (future) ---
  private _invoices = new Map<string, NormalizedInvoice>();
  private _attachments = new Map<string, NormalizedAttachment>();
  private _auditLogs = new Map<string, NormalizedAuditLog>();
  private _notifications = new Map<string, NormalizedNotification>();
  private _integrations = new Map<string, NormalizedIntegration>();
  private _importJobs = new Map<string, NormalizedImportJob>();
  private _exportJobs = new Map<string, NormalizedExportJob>();

  // --- Reactivity ---
  private _listeners = new Set<Listener>();
  private _idCounter = 0;

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // --- Subscription ---

  subscribe(fn: Listener): () => void {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  private _notify(): void {
    this._listeners.forEach(fn => fn());
  }

  // --- ID generation ---

  generateId(): string {
    this._idCounter++;
    return `n${Date.now().toString(36)}_${this._idCounter}${Math.random().toString(36).substring(2, 6)}`;
  }

  // ============================================================
  //  STUDENT CRUD
  // ============================================================

  getAllStudents(): NormalizedStudent[] {
    return Array.from(this._students.values());
  }

  getStudent(id: string): NormalizedStudent | undefined {
    return this._students.get(id);
  }

  findStudent(predicate: (s: NormalizedStudent) => boolean): NormalizedStudent | undefined {
    for (const s of this._students.values()) {
      if (predicate(s)) return s;
    }
    return undefined;
  }

  addStudent(data: NormalizedStudent): void {
    this._students.set(data.id, data);
    this._notify();
  }

  updateStudent(id: string, data: Partial<NormalizedStudent>): void {
    const existing = this._students.get(id);
    if (existing) {
      this._students.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteStudent(id: string): void {
    this._students.delete(id);
    this._notify();
  }

  countStudents(): number {
    return this._students.size;
  }

  // ============================================================
  //  GROUP CRUD
  // ============================================================

  getAllGroups(): NormalizedGroup[] {
    return Array.from(this._groups.values());
  }

  getGroup(id: string): NormalizedGroup | undefined {
    return this._groups.get(id);
  }

  findGroup(predicate: (g: NormalizedGroup) => boolean): NormalizedGroup | undefined {
    for (const g of this._groups.values()) {
      if (predicate(g)) return g;
    }
    return undefined;
  }

  addGroup(data: NormalizedGroup): void {
    this._groups.set(data.id, data);
    this._notify();
  }

  updateGroup(id: string, data: Partial<NormalizedGroup>): void {
    const existing = this._groups.get(id);
    if (existing) {
      this._groups.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteGroup(id: string): void {
    this._groups.delete(id);
    this._notify();
  }

  countGroups(): number {
    return this._groups.size;
  }

  getNextGroupNumber(): number {
    let max = 6800;
    for (const g of this._groups.values()) {
      const num = parseInt(g.code.replace('26-', ''), 10);
      if (!isNaN(num) && num > max) max = num;
    }
    return max + 1;
  }

  getGroupScheduleItems(groupId: string): NormalizedTeacherScheduleItem[] {
    return Array.from(this._scheduleItems.values()).filter(si => si.groupId === groupId);
  }

  // ============================================================
  //  TEACHER CRUD
  // ============================================================

  getAllTeachers(): NormalizedTeacher[] {
    return Array.from(this._teachers.values());
  }

  getTeacher(id: string): NormalizedTeacher | undefined {
    return this._teachers.get(id);
  }

  findTeacher(predicate: (t: NormalizedTeacher) => boolean): NormalizedTeacher | undefined {
    for (const t of this._teachers.values()) {
      if (predicate(t)) return t;
    }
    return undefined;
  }

  addTeacher(data: NormalizedTeacher): void {
    this._teachers.set(data.id, data);
    this._notify();
  }

  updateTeacher(id: string, data: Partial<NormalizedTeacher>): void {
    const existing = this._teachers.get(id);
    if (existing) {
      this._teachers.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteTeacher(id: string): void {
    this._teachers.delete(id);
    this._notify();
  }

  countTeachers(): number {
    return this._teachers.size;
  }

  // ============================================================
  //  LESSON CRUD
  // ============================================================

  getAllLessons(): NormalizedLesson[] {
    return Array.from(this._lessons.values());
  }

  getLesson(id: string): NormalizedLesson | undefined {
    return this._lessons.get(id);
  }

  findLesson(predicate: (l: NormalizedLesson) => boolean): NormalizedLesson | undefined {
    for (const l of this._lessons.values()) {
      if (predicate(l)) return l;
    }
    return undefined;
  }

  addLesson(data: NormalizedLesson): void {
    this._lessons.set(data.id, data);
    this._notify();
  }

  updateLesson(id: string, data: Partial<NormalizedLesson>): void {
    const existing = this._lessons.get(id);
    if (existing) {
      this._lessons.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteLesson(id: string): void {
    this._lessons.delete(id);
    this._notify();
  }

  countLessons(): number {
    return this._lessons.size;
  }

  // ============================================================
  //  PAYMENT CRUD
  // ============================================================

  getAllPayments(): NormalizedPayment[] {
    return Array.from(this._payments.values());
  }

  getPayment(id: string): NormalizedPayment | undefined {
    return this._payments.get(id);
  }

  findPayment(predicate: (p: NormalizedPayment) => boolean): NormalizedPayment | undefined {
    for (const p of this._payments.values()) {
      if (predicate(p)) return p;
    }
    return undefined;
  }

  addPayment(data: NormalizedPayment): void {
    this._payments.set(data.id, data);
    this._notify();
  }

  updatePayment(id: string, data: Partial<NormalizedPayment>): void {
    const existing = this._payments.get(id);
    if (existing) {
      this._payments.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deletePayment(id: string): void {
    this._payments.delete(id);
    this._notify();
  }

  countPayments(): number {
    return this._payments.size;
  }

  // ============================================================
  //  CONTRACT CRUD
  // ============================================================

  getAllContracts(): NormalizedContract[] {
    return Array.from(this._contracts.values());
  }

  getContract(id: string): NormalizedContract | undefined {
    return this._contracts.get(id);
  }

  findContract(predicate: (c: NormalizedContract) => boolean): NormalizedContract | undefined {
    for (const c of this._contracts.values()) {
      if (predicate(c)) return c;
    }
    return undefined;
  }

  addContract(data: NormalizedContract): void {
    this._contracts.set(data.id, data);
    this._notify();
  }

  updateContract(id: string, data: Partial<NormalizedContract>): void {
    const existing = this._contracts.get(id);
    if (existing) {
      this._contracts.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteContract(id: string): void {
    this._contracts.delete(id);
    this._notify();
  }

  // ============================================================
  //  SCHEDULE ITEM CRUD
  // ============================================================

  getAllScheduleItems(): NormalizedTeacherScheduleItem[] {
    return Array.from(this._scheduleItems.values());
  }

  getScheduleItem(id: string): NormalizedTeacherScheduleItem | undefined {
    return this._scheduleItems.get(id);
  }

  addScheduleItem(data: NormalizedTeacherScheduleItem): void {
    this._scheduleItems.set(data.id, data);
    this._notify();
  }

  updateScheduleItem(id: string, data: Partial<NormalizedTeacherScheduleItem>): void {
    const existing = this._scheduleItems.get(id);
    if (existing) {
      this._scheduleItems.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteScheduleItem(id: string): void {
    this._scheduleItems.delete(id);
    this._notify();
  }

  // ============================================================
  //  TASK CRUD
  // ============================================================

  getAllTasks(): NormalizedTask[] {
    return Array.from(this._tasks.values());
  }

  getTask(id: string): NormalizedTask | undefined {
    return this._tasks.get(id);
  }

  addTask(data: NormalizedTask): void {
    this._tasks.set(data.id, data);
    this._notify();
  }

  updateTask(id: string, data: Partial<NormalizedTask>): void {
    const existing = this._tasks.get(id);
    if (existing) {
      this._tasks.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteTask(id: string): void {
    this._tasks.delete(id);
    this._notify();
  }

  // ============================================================
  //  CONVERSATION CRUD
  // ============================================================

  getAllConversations(): NormalizedChatConversation[] {
    return Array.from(this._conversations.values());
  }

  getConversation(id: string): NormalizedChatConversation | undefined {
    return this._conversations.get(id);
  }

  addConversation(data: NormalizedChatConversation): void {
    this._conversations.set(data.id, data);
    this._notify();
  }

  deleteConversation(id: string): void {
    this._conversations.delete(id);
    this._notify();
  }

  // ============================================================
  //  EVENT CRUD
  // ============================================================

  getAllEvents(): NormalizedClubEvent[] {
    return Array.from(this._events.values());
  }

  getEvent(id: string): NormalizedClubEvent | undefined {
    return this._events.get(id);
  }

  addEvent(data: NormalizedClubEvent): void {
    this._events.set(data.id, data);
    this._notify();
  }

  updateEvent(id: string, data: Partial<NormalizedClubEvent>): void {
    const existing = this._events.get(id);
    if (existing) {
      this._events.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteEvent(id: string): void {
    this._events.delete(id);
    this._notify();
  }

  getAllEventRegistrations(): NormalizedEventRegistration[] {
    return Array.from(this._eventRegistrations.values());
  }

  getEventRegistration(id: string): NormalizedEventRegistration | undefined {
    return this._eventRegistrations.get(id);
  }

  addEventRegistration(data: NormalizedEventRegistration): void {
    this._eventRegistrations.set(data.id, data);
    this._notify();
  }

  // ============================================================
  //  CLUB CRUD
  // ============================================================

  getAllClubs(): NormalizedClub[] {
    return Array.from(this._clubs.values());
  }

  getClub(id: string): NormalizedClub | undefined {
    return this._clubs.get(id);
  }

  addClub(data: NormalizedClub): void {
    this._clubs.set(data.id, data);
    this._notify();
  }

  getAllClubMembers(): NormalizedClubMember[] {
    return Array.from(this._clubMembers.values());
  }

  getClubMember(id: string): NormalizedClubMember | undefined {
    return this._clubMembers.get(id);
  }

  addClubMember(data: NormalizedClubMember): void {
    this._clubMembers.set(data.id, data);
    this._notify();
  }

  // ============================================================
  //  TESTING EVENT CRUD
  // ============================================================

  getAllTestingEvents(): NormalizedTestingEvent[] {
    return Array.from(this._testingEvents.values());
  }

  getTestingEvent(id: string): NormalizedTestingEvent | undefined {
    return this._testingEvents.get(id);
  }

  addTestingEvent(data: NormalizedTestingEvent): void {
    this._testingEvents.set(data.id, data);
    this._notify();
  }

  updateTestingEvent(id: string, data: Partial<NormalizedTestingEvent>): void {
    const existing = this._testingEvents.get(id);
    if (existing) {
      this._testingEvents.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteTestingEvent(id: string): void {
    this._testingEvents.delete(id);
    this._notify();
  }

  // ============================================================
  //  FREE SLOT CRUD
  // ============================================================

  getAllFreeSlots(): NormalizedFreeSlot[] {
    return Array.from(this._freeSlots.values());
  }

  getFreeSlot(id: string): NormalizedFreeSlot | undefined {
    return this._freeSlots.get(id);
  }

  addFreeSlot(data: NormalizedFreeSlot): void {
    this._freeSlots.set(data.id, data);
    this._notify();
  }

  updateFreeSlot(id: string, data: Partial<NormalizedFreeSlot>): void {
    const existing = this._freeSlots.get(id);
    if (existing) {
      this._freeSlots.set(id, { ...existing, ...data });
      this._notify();
    }
  }

  // ============================================================
  //  VACATION CRUD
  // ============================================================

  getAllVacations(): NormalizedVacation[] {
    return Array.from(this._vacations.values());
  }

  getVacation(id: string): NormalizedVacation | undefined {
    return this._vacations.get(id);
  }

  addVacation(data: NormalizedVacation): void {
    this._vacations.set(data.id, data);
    this._notify();
  }

  updateVacation(id: string, data: Partial<NormalizedVacation>): void {
    const existing = this._vacations.get(id);
    if (existing) {
      this._vacations.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteVacation(id: string): void {
    this._vacations.delete(id);
    this._notify();
  }

  // ============================================================
  //  ADMIN SHIFT CRUD
  // ============================================================

  getAllAdminShifts(): NormalizedAdminShift[] {
    return Array.from(this._adminShifts.values());
  }

  getAdminShift(id: string): NormalizedAdminShift | undefined {
    return this._adminShifts.get(id);
  }

  addAdminShift(data: NormalizedAdminShift): void {
    this._adminShifts.set(data.id, data);
    this._notify();
  }

  updateAdminShift(id: string, data: Partial<NormalizedAdminShift>): void {
    const existing = this._adminShifts.get(id);
    if (existing) {
      this._adminShifts.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteAdminShift(id: string): void {
    this._adminShifts.delete(id);
    this._notify();
  }

  // ============================================================
  //  USER CRUD
  // ============================================================

  getAllUsers(): NormalizedUser[] {
    return Array.from(this._users.values());
  }

  getUser(id: string): NormalizedUser | undefined {
    return this._users.get(id);
  }

  findUser(predicate: (u: NormalizedUser) => boolean): NormalizedUser | undefined {
    for (const u of this._users.values()) {
      if (predicate(u)) return u;
    }
    return undefined;
  }

  addUser(data: NormalizedUser): void {
    this._users.set(data.id, data);
    this._notify();
  }

  updateUser(id: string, data: Partial<NormalizedUser>): void {
    const existing = this._users.get(id);
    if (existing) {
      this._users.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteUser(id: string): void {
    this._users.delete(id);
    this._notify();
  }

  // ============================================================
  //  PERMISSION CRUD
  // ============================================================

  getAllPermissions(): NormalizedPermission[] {
    return Array.from(this._permissions.values());
  }

  getAllRolePermissions(): NormalizedRolePermission[] {
    return Array.from(this._rolePermissions.values());
  }

  setPermissions(permissions: NormalizedPermission[]): void {
    this._permissions.clear();
    permissions.forEach(p => this._permissions.set(p.id, p));
    this._notify();
  }

  setRolePermissions(rp: NormalizedRolePermission[]): void {
    this._rolePermissions.clear();
    rp.forEach(r => this._rolePermissions.set(r.role, r));
    this._notify();
  }

  // ============================================================
  //  LEAD CRUD
  // ============================================================

  getAllLeads(): NormalizedLead[] {
    return Array.from(this._leads.values());
  }

  getLead(id: string): NormalizedLead | undefined {
    return this._leads.get(id);
  }

  addLead(data: NormalizedLead): void {
    this._leads.set(data.id, data);
    this._notify();
  }

  updateLead(id: string, data: Partial<NormalizedLead>): void {
    const existing = this._leads.get(id);
    if (existing) {
      this._leads.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  deleteLead(id: string): void {
    this._leads.delete(id);
    this._notify();
  }

  // ============================================================
  //  APPLICATION CRUD
  // ============================================================

  getAllApplications(): NormalizedApplication[] {
    return Array.from(this._applications.values());
  }

  getApplication(id: string): NormalizedApplication | undefined {
    return this._applications.get(id);
  }

  addApplication(data: NormalizedApplication): void {
    this._applications.set(data.id, data);
    this._notify();
  }

  // ============================================================
  //  COMMENT CRUD
  // ============================================================

  getAllComments(): NormalizedComment[] {
    return Array.from(this._comments.values());
  }

  getComment(id: string): NormalizedComment | undefined {
    return this._comments.get(id);
  }

  /** Get all comments for a specific entity */
  getEntityComments(entityType: NormalizedComment['entityType'], entityId: string): NormalizedComment[] {
    return this._getByIndex(this._comments, c => c.entityType === entityType && c.entityId === entityId);
  }

  addComment(data: NormalizedComment): void {
    this._comments.set(data.id, data);
    this._notify();
  }

  updateComment(id: string, data: Partial<NormalizedComment>): void {
    const existing = this._comments.get(id);
    if (existing) {
      this._comments.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  softDeleteComment(id: string): void {
    const existing = this._comments.get(id);
    if (existing) {
      this._comments.set(id, { ...existing, deletedAt: new Date(), updatedAt: new Date() });
      this._notify();
    }
  }

  // ============================================================
  //  ROOM CRUD
  // ============================================================

  getAllRooms(): NormalizedRoom[] {
    return Array.from(this._rooms.values());
  }

  getRoom(id: string): NormalizedRoom | undefined {
    return this._rooms.get(id);
  }

  addRoom(data: NormalizedRoom): void {
    this._rooms.set(data.id, data);
    this._notify();
  }

  updateRoom(id: string, data: Partial<NormalizedRoom>): void {
    const existing = this._rooms.get(id);
    if (existing) {
      this._rooms.set(id, { ...existing, ...data, updatedAt: new Date() });
      this._notify();
    }
  }

  // ============================================================
  //  BRANCH CRUD
  // ============================================================

  getAllBranches(): NormalizedBranch[] {
    return Array.from(this._branches.values());
  }

  getBranch(id: string): NormalizedBranch | undefined {
    return this._branches.get(id);
  }

  addBranch(data: NormalizedBranch): void {
    this._branches.set(data.id, data);
    this._notify();
  }

  // ============================================================
  //  INFRASTRUCTURE (future modules — storage ready)
  // ============================================================

  getAllInvoices(): NormalizedInvoice[] {
    return Array.from(this._invoices.values());
  }

  getInvoice(id: string): NormalizedInvoice | undefined {
    return this._invoices.get(id);
  }

  addInvoice(data: NormalizedInvoice): void {
    this._invoices.set(data.id, data);
    this._notify();
  }

  getAllAttachments(): NormalizedAttachment[] {
    return Array.from(this._attachments.values());
  }

  addAttachment(data: NormalizedAttachment): void {
    this._attachments.set(data.id, data);
    this._notify();
  }

  getAllAuditLogs(): NormalizedAuditLog[] {
    return Array.from(this._auditLogs.values());
  }

  addAuditLog(data: NormalizedAuditLog): void {
    this._auditLogs.set(data.id, data);
  }

  getAllNotifications(): NormalizedNotification[] {
    return Array.from(this._notifications.values());
  }

  addNotification(data: NormalizedNotification): void {
    this._notifications.set(data.id, data);
    this._notify();
  }

  markNotificationRead(id: string): void {
    const n = this._notifications.get(id);
    if (n) {
      this._notifications.set(id, { ...n, isRead: true });
      this._notify();
    }
  }

  getAllIntegrations(): NormalizedIntegration[] {
    return Array.from(this._integrations.values());
  }

  addIntegration(data: NormalizedIntegration): void {
    this._integrations.set(data.id, data);
    this._notify();
  }

  getAllImportJobs(): NormalizedImportJob[] {
    return Array.from(this._importJobs.values());
  }

  addImportJob(data: NormalizedImportJob): void {
    this._importJobs.set(data.id, data);
    this._notify();
  }

  getAllExportJobs(): NormalizedExportJob[] {
    return Array.from(this._exportJobs.values());
  }

  addExportJob(data: NormalizedExportJob): void {
    this._exportJobs.set(data.id, data);
    this._notify();
  }

  // ============================================================
  //  RELATION HELPERS
  // ============================================================

  /** Get all students belonging to a group */
  getGroupStudents(groupId: string): NormalizedStudent[] {
    const group = this._groups.get(groupId);
    if (!group) return [];
    return group.studentIds.map(id => this._students.get(id)).filter(Boolean) as NormalizedStudent[];
  }

  /** Get groups a student belongs to */
  getStudentGroups(studentId: string): NormalizedGroup[] {
    const student = this._students.get(studentId);
    if (!student) return [];
    return student.groupIds.map(id => this._groups.get(id)).filter(Boolean) as NormalizedGroup[];
  }

  /** Get schedule items for a teacher */
  getTeacherScheduleItems(teacherId: string): NormalizedTeacherScheduleItem[] {
    const teacher = this._teachers.get(teacherId);
    if (!teacher) return [];
    return teacher.scheduleItemIds.map(id => this._scheduleItems.get(id)).filter(Boolean) as NormalizedTeacherScheduleItem[];
  }

  /** Get lessons for a group */
  getGroupLessons(groupId: string): NormalizedLesson[] {
    const group = this._groups.get(groupId);
    if (!group) return [];
    return group.lessonIds.map(id => this._lessons.get(id)).filter(Boolean) as NormalizedLesson[];
  }

  /** Get payments for a student */
  getStudentPayments(studentId: string): NormalizedPayment[] {
    const student = this._students.get(studentId);
    if (!student) return [];
    return student.paymentIds.map(id => this._payments.get(id)).filter(Boolean) as NormalizedPayment[];
  }

  /** Get groups taught by a teacher */
  getTeacherGroups(teacherId: string): NormalizedGroup[] {
    const teacher = this._teachers.get(teacherId);
    if (!teacher) return [];
    return teacher.groupIds.map(id => this._groups.get(id)).filter(Boolean) as NormalizedGroup[];
  }

  // ============================================================
  //  BULK IMPORT
  // ============================================================

  importStudents(students: NormalizedStudent[]): void {
    students.forEach(s => this._students.set(s.id, s));
    this._notify();
  }

  importGroups(groups: NormalizedGroup[]): void {
    groups.forEach(g => this._groups.set(g.id, g));
    this._notify();
  }

  importTeachers(teachers: NormalizedTeacher[]): void {
    teachers.forEach(t => this._teachers.set(t.id, t));
    this._notify();
  }

  importLessons(lessons: NormalizedLesson[]): void {
    lessons.forEach(l => this._lessons.set(l.id, l));
    this._notify();
  }

  importPayments(payments: NormalizedPayment[]): void {
    payments.forEach(p => this._payments.set(p.id, p));
    this._notify();
  }

  // ============================================================
  //  RESET
  // ============================================================

  clear(): void {
    this._students.clear();
    this._groups.clear();
    this._teachers.clear();
    this._lessons.clear();
    this._payments.clear();
    this._contracts.clear();
    this._scheduleItems.clear();
    this._tasks.clear();
    this._conversations.clear();
    this._events.clear();
    this._eventRegistrations.clear();
    this._clubs.clear();
    this._clubMembers.clear();
    this._testingEvents.clear();
    this._freeSlots.clear();
    this._vacations.clear();
    this._adminShifts.clear();
    this._users.clear();
    this._permissions.clear();
    this._rolePermissions.clear();
    this._leads.clear();
    this._applications.clear();
    this._rooms.clear();
    this._branches.clear();
    this._comments.clear();
    this._invoices.clear();
    this._attachments.clear();
    this._auditLogs.clear();
    this._notifications.clear();
    this._integrations.clear();
    this._importJobs.clear();
    this._exportJobs.clear();
    this._notify();
  }

  // ============================================================
  //  INTERNAL HELPERS
  // ============================================================

  private _getByIndex<T extends { id: string }>(
    map: Map<string, T>,
    predicate: (item: T) => boolean
  ): T[] {
    const result: T[] = [];
    for (const item of map.values()) {
      if (predicate(item)) result.push(item);
    }
    return result;
  }
}
