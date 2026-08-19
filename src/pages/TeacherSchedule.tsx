import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import {
  ChevronLeft, ChevronRight, StickyNote, Plus, Trash2, X,
  Edit, Move, MessageSquare, RotateCcw, CheckCircle,
} from 'lucide-react';

import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '../components/ui/alert-dialog';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { allTeachers, allStudents, allGroups } from '../data/sampleData';
import { realGroups } from '../data/realGroups';
import { DataStore } from '../data/store';
import { TeacherScheduleItem, Teacher, Group, ScheduleStatus, CellComment, TeacherComment, RecurrenceRule } from '../types';
import { NormalizedTeacherScheduleItem } from '../types/normalized';
import ScheduleLessonDialog from '../components/schedule/ScheduleLessonDialog';
import CreateGroupDialog from '../components/group/CreateGroupDialog';
import DropConfirmDialog from '../components/schedule/DropConfirmDialog';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parse, getDay, differenceInMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  dayNames, LESSON_TYPE_LABELS, getScheduleCardColors,
  START_HOUR, END_HOUR, SLOT_MINUTES, SLOT_HEIGHT, DAY_HEADER_HEIGHT,
  STATUS_MAP,
} from './teacherSchedule/constants';
import {
  getScheduleForDay, getWeekKey,
  loadComments, saveComments,
  loadTeacherComments, saveTeacherComments,
  loadIndividualLessons, saveIndividualLessons,
  getMondayFirstDayIndex,
} from './teacherSchedule/helpers';

function getStatusStyle(status: ScheduleStatus) {
  return STATUS_MAP[status] || STATUS_MAP.unavailable;
}

function isTeacherOnVacation(teacher: Teacher, date: Date): boolean {
  return teacher.vacations.some(v =>
    v.status === 'approved' && date >= v.startDate && date <= v.endDate
  );
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

function isCurrentTime(date: Date, start: number, end: number): boolean {
  const now = new Date();
  if (!isSameDay(date, now)) return false;
  const nowVal = now.getHours() + now.getMinutes() / 60;
  return nowVal >= start && nowVal < end;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function isSunday(date: Date): boolean {
  return getDay(date) === 0;
}

function isHoliday(date: Date): string | null {
  const holidays2026: Record<string, string> = {
    '2026-01-01': 'Новый год',
    '2026-01-07': 'Рождество',
    '2026-02-23': 'День защитника Отечества',
    '2026-03-08': 'Международный женский день',
    '2026-05-01': 'Праздник Весны и Труда',
    '2026-05-09': 'День Победы',
    '2026-06-12': 'День России',
    '2026-11-04': 'День народного единства',
  };
  const key = format(date, 'yyyy-MM-dd');
  return holidays2026[key] || null;
}

function formatTimeFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatRoomKey(key: string | undefined): string {
  if (!key) return '';
  if (key.startsWith('zoom')) return `Zoom ${key.replace('zoom', '')}`;
  if (key === 'office') return 'Офис';
  if (key.startsWith('room')) return key.replace('room', 'Каб. ');
  return key;
}

export default function TeacherSchedule() {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterClassroom, setFilterClassroom] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<'individual' | 'testing' | 'trial'>('individual');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [cfLanguage, setCfLanguage] = useState<'German' | 'English'>('German');
  const [selectedSlot, setSelectedSlot] = useState<{ teacherId: string; day: Date; slot: number } | null>(null);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'cancel' | 'delete' | 'move' | null>(null);
  const [selectedItem, setSelectedItem] = useState<TeacherScheduleItem | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextItem, setContextItem] = useState<TeacherScheduleItem | null>(null);
  const [recurrenceEditOpen, setRecurrenceEditOpen] = useState(false);
  const [recurrenceEditAction, setRecurrenceEditAction] = useState<'this' | 'future' | 'all'>('this');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSlot, setCommentSlot] = useState<{ teacherId: string; dayIndex: number; slotIndex: number } | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Comments per week
  const weekKey = getWeekKey(currentDate);
  const [comments, setComments] = useState<CellComment[]>(() => loadComments(weekKey));

  // Reload cell comments when week changes
  useEffect(() => {
    setComments(loadComments(weekKey));
  }, [weekKey]);

  // Teacher-level comments
  const [teacherComments, setTeacherComments] = useState<TeacherComment[]>(() => loadTeacherComments(weekKey));

  // Reload teacher comments when week changes
  useEffect(() => {
    setTeacherComments(loadTeacherComments(weekKey));
  }, [weekKey]);

  // Clean ALL stale localStorage comments on mount
  useEffect(() => {
    const keysToClean: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('teacher_comments_') || key?.startsWith('schedule_comments_')) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) { keysToClean.push(key); continue; }
          const data = JSON.parse(raw);
          if (!Array.isArray(data)) { keysToClean.push(key); continue; }
          const cleaned = data.filter((comment: unknown) => {
            if (typeof comment !== 'object' || comment === null) return false;
            const text = (comment as { text?: unknown }).text;
            return typeof text === 'string' && text.trim().length > 1;
          });
          if (cleaned.length === 0) {
            keysToClean.push(key);
          } else if (cleaned.length !== data.length) {
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch {
          keysToClean.push(key);
        }
      }
    }
    keysToClean.forEach(key => localStorage.removeItem(key));
  }, []);

  const [teacherContextMenuPos, setTeacherContextMenuPos] = useState<{ x: number; y: number; teacherId: string } | null>(null);
  const [teacherCommentDialogOpen, setTeacherCommentDialogOpen] = useState(false);
  const [teacherCommentText, setTeacherCommentText] = useState('');
  const [teacherCommentTarget, setTeacherCommentTarget] = useState<string | null>(null);
  const [lessonInfoItem, setLessonInfoItem] = useState<TeacherScheduleItem | null>(null);
  const [dropConfirmOpen, setDropConfirmOpen] = useState(false);

  // Individual lessons
  const [individualLessons, setIndividualLessons] = useState<TeacherScheduleItem[]>(() => loadIndividualLessons());

  useEffect(() => {
    saveIndividualLessons(individualLessons);
  }, [individualLessons]);

  // Create form state
  const [cfTeacher, setCfTeacher] = useState('');
  const [cfDate, setCfDate] = useState('');
  const [cfTime, setCfTime] = useState('10:00');
  const [cfDuration, setCfDuration] = useState('90');
  const [cfFormat, setCfFormat] = useState('offline');
  const [cfRoom, setCfRoom] = useState('auto');
  const [cfStudent, setCfStudent] = useState('');
  const [cfRepeat, setCfRepeat] = useState('none');
  const [cfComment, setCfComment] = useState('');
  const [cfPaymentType, setCfPaymentType] = useState<'single' | 'package'>('single');
  const [cfPackageSize, setCfPackageSize] = useState('8');
  const [cfErrors, setCfErrors] = useState<string[]>([]);
  const cfTouched = useRef(false);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

  // Drag & Drop state
  const [dragItem, setDragItem] = useState<TeacherScheduleItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ teacherId: string; day: Date; startMinutes: number } | null>(null);
  const [dragValid, setDragValid] = useState<boolean | null>(null);
  const [resizePreview, setResizePreview] = useState<{ id: string; endTime: string } | null>(null);
  const pendingResizeRef = useRef<{ endTime: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [pendingDropTarget, setPendingDropTarget] = useState<{ teacherId: string; day: Date; slotStart: number } | null>(null);
  const [dropConfirmItem, setDropConfirmItem] = useState<{ item: TeacherScheduleItem; newStart: string; newEnd: string; suggestedRoom?: string } | null>(null);

  // Reset form when slot selected
  useEffect(() => {
    if (selectedSlot) {
      setCfTeacher(selectedSlot.teacherId);
      setCfDate(format(selectedSlot.day, 'yyyy-MM-dd'));
      const h = Math.floor(selectedSlot.slot);
      const m = (selectedSlot.slot % 1) * 60;
      setCfTime(`${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`);
      setCfRoom('auto');
    }
  }, [selectedSlot]);

  // Prefill form when editing existing lesson
  useEffect(() => {
    if (selectedItem && createOpen) {
      setCreateType(selectedItem.type === 'testing' ? 'testing' : selectedItem.type === 'trial' ? 'trial' : 'individual');
      setCfTeacher(selectedItem.teacherId || '');
      setCfDate(format(selectedItem.date, 'yyyy-MM-dd'));
      setCfTime(selectedItem.startTime);
      setCfDuration(String(parseTime(selectedItem.endTime) - parseTime(selectedItem.startTime)));
      setCfFormat(selectedItem.format || 'offline');
      setCfRoom(selectedItem.classroom || selectedItem.zoomRoom || 'auto');
      setCfComment(selectedItem.comment || '');
      setCfStudent(selectedItem.studentId || '');
      setCfRepeat(selectedItem.recurrenceRule ? selectedItem.recurrenceRule.frequency : 'none');
      setCfPaymentType(selectedItem.paymentType || 'single');
      setCfPackageSize(String(selectedItem.packageSize || '8'));
      setCfLanguage((selectedItem.groupLanguage || 'German') as 'German' | 'English');
    }
  }, [selectedItem, createOpen]);

  const validateForm = () => {
    const errs: string[] = [];
    if (!cfTeacher) errs.push('Выберите преподавателя');
    if (!cfDate) errs.push('Укажите дату');
    if (!cfTime) errs.push('Укажите время');
    if ((createType === 'individual' || createType === 'testing' || createType === 'trial') && !cfStudent) errs.push('Выберите ученика');
    if (createType === 'individual' && cfPaymentType === 'package' && (!cfPackageSize || Number(cfPackageSize) < 1)) errs.push('Укажите количество занятий в абонементе');

    const teacher = allTeachers.find(t => t.user.id === cfTeacher);
    if (teacher && cfDate) {
      const d = new Date(cfDate);
      if (isTeacherOnVacation(teacher, d)) {
        errs.push(`Преподаватель ${teacher.user.name} в отпуске на эту дату`);
      }
    }

    if (!cfTime || isNaN(Number(cfTime.split(':')[0]))) return errs;
    const [h, m] = cfTime.split(':').map(Number);
    const startVal = h + m / 60;
    const endVal = startVal + Number(cfDuration) / 60;
    if (startVal < START_HOUR || endVal > END_HOUR) {
      errs.push(`Занятие должно быть в диапазоне ${START_HOUR}:00 – ${END_HOUR}:00`);
    }

    // Room auto-suggest validation
    if (cfTeacher && cfDate && cfTime) {
      if (availableRooms.length === 0) {
        errs.push(cfFormat === 'online' ? 'Нет свободных Zoom' : 'Нет свободных аудиторий');
      } else if (!cfRoom || cfRoom === 'auto' || !availableRooms.includes(cfRoom)) {
        errs.push('Выберите свободный кабинет / Zoom');
      }
    }

    // Conflict checks
    if (teacher && cfDate) {
      const d = new Date(cfDate);
      const groupItems = getScheduleForDay(teacher, d);
      const indivItems = individualLessons.filter(l => isSameDay(l.date, d) && l.teacherId === teacher.user.id && l.id !== (selectedItem?.id || ''));
      const teacherBusy = [...groupItems, ...indivItems].some(item =>
        parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
      );
      if (teacherBusy) {
        const busyItem = [...groupItems, ...indivItems].find(item =>
          parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
        );
        if (busyItem) {
          const typeLabel = busyItem.type === 'individual' ? 'Индивидуальное' : busyItem.type === 'testing' ? 'Тестирование' : busyItem.type === 'trial' ? 'Пробный урок' : 'Группа';
          const nameLabel = busyItem.group?.name || busyItem.studentName || '';
          errs.push(`Конфликт расписания\nПреподаватель уже занят\n${busyItem.startTime}–${busyItem.endTime}\n${typeLabel}${nameLabel ? ' ' + nameLabel : ''}`);
        } else {
          errs.push(`Преподаватель ${teacher.user.name} уже занят в это время`);
        }
      }
    }

    // Conflict check — room / Zoom busy (group + individual)
    if (cfRoom && cfRoom !== 'auto' && cfDate) {
      const d = new Date(cfDate);
      for (const t of allTeachers) {
        const groupItems = getScheduleForDay(t, d);
        const indivItems = individualLessons.filter(l => isSameDay(l.date, d) && l.id !== (selectedItem?.id || ''));
        const roomBusy = [...groupItems, ...indivItems].some(item =>
          (item.classroom === cfRoom || item.zoomRoom === cfRoom) &&
          parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
        );
        if (roomBusy) {
          const busyItem = [...groupItems, ...indivItems].find(item =>
            (item.classroom === cfRoom || item.zoomRoom === cfRoom) &&
            parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
          );
          const roomLabel = cfRoom.startsWith('zoom') ? `Zoom ${cfRoom.replace('zoom', '')}` : (cfRoom === 'office' ? 'Офис' : `Каб. ${cfRoom.replace('room', '')}`);
          const busyType = busyItem?.type === 'individual' ? 'Индивидуальное занятие' : busyItem?.type === 'testing' ? 'Тестирование' : busyItem?.type === 'trial' ? 'Пробный урок' : 'Групповое занятие';
          errs.push(`${roomLabel} уже используется\n${busyItem?.startTime || ''}–${busyItem?.endTime || ''}\n${busyType}`);
          break;
        }
      }
    }

    // Conflict check — student busy (individual + group)
    if ((createType === 'individual' || createType === 'testing' || createType === 'trial') && cfStudent && cfDate && cfTime) {
      const d = new Date(cfDate);
      const studentInGroup = allGroups.filter(g => g.students.some(s => s.id === cfStudent));
      const groupConflicts: string[] = [];
      for (const g of studentInGroup) {
        const teacher = allTeachers.find(t => t.user.id === g.teacher.id);
        if (!teacher) continue;
        const dayItems = getScheduleForDay(teacher, d);
        const conflict = dayItems.some(item =>
          item.group?.id === g.id &&
          parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
        );
        if (conflict) {
          groupConflicts.push(g.name);
        }
      }
      const indivConflict = individualLessons.some(l =>
        isSameDay(l.date, d) &&
        l.studentId === cfStudent &&
        l.id !== (selectedItem?.id || '') &&
        parseTime(l.startTime) < endVal && parseTime(l.endTime) > startVal
      );
      if (indivConflict || groupConflicts.length > 0) {
        const reasons: string[] = [];
        if (indivConflict) reasons.push('индивидуальное занятие');
        if (groupConflicts.length > 0) reasons.push(`группа ${groupConflicts.join(', ')}`);
        errs.push(`Конфликт расписания\nУченик уже записан на ${reasons.join(' и ')} в это время`);
      }
    }

    return errs;
  };

  const OFFLINE_ROOMS = ['office', 'room2', 'room3', 'room4', 'room5'];
  const ONLINE_ROOMS = ['zoom1', 'zoom2', 'zoom3', 'zoom4', 'zoom5', 'zoom6', 'zoom7', 'zoom8'];

  const isRoomAvailable = (room: string, d: Date, startVal: number, endVal: number): boolean => {
    for (const t of allTeachers) {
      const groupItems = getScheduleForDay(t, d);
      const indivItems = individualLessons.filter(l => isSameDay(l.date, d) && l.teacherId === t.user.id && l.id !== (selectedItem?.id || ''));
      const busy = [...groupItems, ...indivItems].some(item =>
        (item.classroom === room || item.zoomRoom === room) &&
        parseTime(item.startTime) < endVal && parseTime(item.endTime) > startVal
      );
      if (busy) return false;
    }
    return true;
  };

  const computeAvailableRooms = () => {
    if (!cfTeacher || !cfDate || !cfTime || isNaN(Number(cfTime.split(':')[0]))) {
      setAvailableRooms([]);
      return;
    }
    const d = new Date(cfDate);
    const [h, m] = cfTime.split(':').map(Number);
    const startVal = h + m / 60;
    const endVal = startVal + Number(cfDuration) / 60;
    const candidates = cfFormat === 'online' ? ONLINE_ROOMS : OFFLINE_ROOMS;
    const free = candidates.filter(room => isRoomAvailable(room, d, startVal, endVal));
    setAvailableRooms(free);
    if (free.length > 0 && (!cfRoom || cfRoom === 'auto' || !free.includes(cfRoom))) {
      setCfRoom(free[0]);
    } else if (free.length === 0) {
      setCfRoom('auto');
    }
  };

  // Auto-suggest rooms when key fields change
  useEffect(() => {
    computeAvailableRooms();
  }, [cfTeacher, cfDate, cfTime, cfDuration, cfFormat]);

  // Real-time conflict check on field changes
  useEffect(() => {
    if (!createOpen) {
      if (cfErrors.length > 0) setCfErrors([]);
      return;
    }
    if (cfTouched.current) {
      const errs = validateForm();
      setCfErrors(errs);
    }
  }, [cfTeacher, cfDate, cfTime, cfDuration, cfRoom, cfStudent, cfPaymentType, cfPackageSize, createType, createOpen, individualLessons, selectedItem]);

  const generateRecurrenceInstances = (base: TeacherScheduleItem, rule: RecurrenceRule): TeacherScheduleItem[] => {
    const instances: TeacherScheduleItem[] = [base];
    if (rule.frequency === 'none' || rule.frequency === 'custom') return instances;
    const intervals: Record<string, number> = { weekly: 7, biweekly: 14, monthly: 30 };
    const days = intervals[rule.frequency] || 7;
    const recurrenceId = generateId();
    instances[0] = { ...base, recurrenceId };
    for (let i = 1; i <= 8; i++) {
      const nextDate = new Date(base.date);
      nextDate.setDate(nextDate.getDate() + days * i);
      instances.push({
        ...base,
        id: generateId(),
        date: nextDate,
        recurrenceId,
      });
    }
    return instances;
  };

  const handleCreate = () => {
    cfTouched.current = true;
    const errs = validateForm();
    if (errs.length > 0) {
      setCfErrors(errs);
      return;
    }

    if (createType === 'individual') {
      const [h, m] = cfTime.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const duration = Number(cfDuration);
      const endMinutes = startMinutes + duration;
      const endTime = formatTimeFromMinutes(endMinutes);
      const student = allStudents.find(s => s.id === cfStudent);

      const baseLesson: TeacherScheduleItem = {
        id: generateId(),
        teacherId: cfTeacher,
        date: new Date(cfDate),
        startTime: cfTime,
        endTime,
        type: 'individual',
        status: 'unpaid',
        classroom: cfRoom !== 'auto' ? cfRoom : undefined,
        format: cfFormat as 'online' | 'offline',
        comment: cfComment || undefined,
        studentId: student?.id,
        studentName: student?.name,
        paymentType: cfPaymentType,
        packageSize: cfPaymentType === 'package' ? Number(cfPackageSize) : undefined,
        completedCount: cfPaymentType === 'package' ? 0 : undefined,
        recurrenceRule: cfRepeat !== 'none' ? {
          frequency: cfRepeat as 'weekly' | 'biweekly' | 'monthly',
          interval: cfRepeat === 'biweekly' ? 2 : 1,
        } : undefined,
      };

      const lessons = cfRepeat !== 'none' && baseLesson.recurrenceRule
        ? generateRecurrenceInstances(baseLesson, baseLesson.recurrenceRule)
        : [baseLesson];

      setIndividualLessons(prev => [...prev, ...lessons]);
    }

    if (createType === 'testing' || createType === 'trial') {
      const [h, m] = cfTime.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const duration = Number(cfDuration);
      const endMinutes = startMinutes + duration;
      const endTime = formatTimeFromMinutes(endMinutes);
      const student = allStudents.find(s => s.id === cfStudent);

      const newTesting: TeacherScheduleItem = {
        id: generateId(),
        teacherId: cfTeacher,
        date: new Date(cfDate),
        startTime: cfTime,
        endTime,
        type: createType,
        status: 'unpaid',
        classroom: cfRoom !== 'auto' ? cfRoom : undefined,
        format: cfFormat as 'online' | 'offline',
        comment: cfComment || undefined,
        studentId: student?.id,
        studentName: student?.name,
      };

      setIndividualLessons(prev => [...prev, newTesting]);
    }

    setCfErrors([]);
    setCreateOpen(false);
    setSelectedSlot(null);
    setSelectedItem(null);
    setAvailableRooms([]);
  };

  const handleContextMenu = (e: React.MouseEvent, item: TeacherScheduleItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextItem(item);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleContextAction = (action: string) => {
    if (!contextItem) return;
    setContextMenuPos(null);

    switch (action) {
      case 'open_group':
        if (contextItem.group) {
          window.open(`/groups`, '_blank');
        }
        break;
      case 'edit':
        setSelectedItem(contextItem);
        setSelectedSlot(null);
        setCreateOpen(true);
        break;
      case 'move':
        setSelectedItem(contextItem);
        if (contextItem.recurrenceRule) {
          setRecurrenceEditAction('this');
          setBulkActionType('move');
          setRecurrenceEditOpen(true);
        } else {
          setBulkActionType('move');
          setBulkActionOpen(true);
        }
        break;
      case 'cancel':
        setSelectedItem(contextItem);
        if (contextItem.recurrenceRule) {
          setRecurrenceEditAction('this');
          setBulkActionType('cancel');
          setRecurrenceEditOpen(true);
        } else {
          setBulkActionType('cancel');
          setBulkActionOpen(true);
        }
        break;
      case 'conduct':
        setSelectedItem(contextItem);
        executeConduct();
        break;
      case 'restore':
        setSelectedItem(contextItem);
        executeRestore();
        break;
      case 'delete':
        setSelectedItem(contextItem);
        if (contextItem.recurrenceRule) {
          setRecurrenceEditAction('this');
          setBulkActionType('delete');
          setRecurrenceEditOpen(true);
        } else {
          setBulkActionType('delete');
          setBulkActionOpen(true);
        }
        break;
      case 'comment':
        setSelectedItem(contextItem);
        setCommentText('');
        setCommentDialogOpen(true);
        break;
    }
  };

  const executeCancel = () => {
    if (!selectedItem) return;

    // Update DataStore if item exists there — save previousStatus
    const store = DataStore.getInstance();
    const dsItem = store.getScheduleItem(selectedItem.id);
    if (dsItem) {
      store.updateScheduleItem(selectedItem.id, {
        status: 'cancelled' as ScheduleStatus,
        previousStatus: (dsItem.status || selectedItem.status) as ScheduleStatus,
      });
    }

    setIndividualLessons(prev =>
      prev.map(l => l.id === selectedItem.id ? { ...l, previousStatus: l.status, status: 'cancelled' as ScheduleStatus } : l)
    );

    allTeachers.forEach(t => {
      t.schedule = t.schedule.map(s =>
        s.id === selectedItem.id ? { ...s, previousStatus: s.status, status: 'cancelled' as ScheduleStatus } : s
      );
    });

    setBulkActionOpen(false);
    setSelectedItem(null);
  };

  const executeRestore = () => {
    if (!selectedItem) return;

    // Try previousStatus from DataStore first, fallback to selectedItem, then 'unpaid'
    const store = DataStore.getInstance();
    const dsItem = store.getScheduleItem(selectedItem.id);
    const originalStatus = (dsItem?.previousStatus || selectedItem.previousStatus || 'unpaid') as ScheduleStatus;

    if (dsItem) {
      store.updateScheduleItem(selectedItem.id, {
        status: originalStatus,
        previousStatus: undefined,
      });
    }

    setIndividualLessons(prev =>
      prev.map(l => l.id === selectedItem.id ? { ...l, status: originalStatus, previousStatus: undefined } : l)
    );

    allTeachers.forEach(t => {
      t.schedule = t.schedule.map(s =>
        s.id === selectedItem.id ? { ...s, status: originalStatus, previousStatus: undefined } : s
      );
    });

    setContextItem(null);
    setContextMenuPos(null);
    setSelectedItem(null);
  };

  const executeConduct = () => {
    if (!selectedItem) return;
    const newCount = (selectedItem.completedCount ?? 0) + 1;

    setIndividualLessons(prev =>
      prev.map(l => l.id === selectedItem.id ? { ...l, completedCount: newCount } : l)
    );

    allTeachers.forEach(t => {
      t.schedule = t.schedule.map(s =>
        s.id === selectedItem.id ? { ...s, completedCount: newCount } : s
      );
    });

    setContextItem(null);
    setContextMenuPos(null);
    setSelectedItem(null);
  };

  const executeDelete = () => {
    if (!selectedItem) return;

    // Delete from DataStore (for real_si_ items)
    const store = DataStore.getInstance();
    const dsItem = store.getScheduleItem(selectedItem.id);
    if (dsItem) store.deleteScheduleItem(selectedItem.id);

    setIndividualLessons(prev =>
      prev.filter(l => !(l.id === selectedItem.id || 
        (recurrenceEditAction === 'all' && l.recurrenceRule && selectedItem.recurrenceRule &&
          l.recurrenceRule.frequency === selectedItem.recurrenceRule.frequency) ||
        (recurrenceEditAction === 'future' && l.recurrenceRule && selectedItem.recurrenceRule &&
          l.date >= selectedItem.date))
      )
    );

    allTeachers.forEach(t => {
      if (recurrenceEditAction === 'this') {
        t.schedule = t.schedule.filter(s => s.id !== selectedItem.id);
      } else if (recurrenceEditAction === 'future') {
        t.schedule = t.schedule.filter(s => !(s.id === selectedItem.id || (s.date >= selectedItem.date && s.recurrenceId === selectedItem.recurrenceId)));
      } else {
        t.schedule = t.schedule.filter(s => s.recurrenceId !== selectedItem.recurrenceId);
      }
    });

    setBulkActionOpen(false);
    setRecurrenceEditOpen(false);
    setSelectedItem(null);
  };

  const handleRecurrenceEdit = () => {
    if (!selectedItem) return;
    if (bulkActionType === 'cancel') {
      executeCancel();
    } else if (bulkActionType === 'delete') {
      executeDelete();
    } else if (bulkActionType === 'move') {
      if (pendingDropTarget) {
        const duration = differenceInMinutes(
          parse(selectedItem.endTime, 'HH:mm', new Date()),
          parse(selectedItem.startTime, 'HH:mm', new Date())
        );
        const newStart = formatTimeFromMinutes(pendingDropTarget.slotStart);
        const newEnd = formatTimeFromMinutes(pendingDropTarget.slotStart + duration);

        // Auto-suggest room
        const formatVal = selectedItem.format || 'offline';
        const roomCandidates = formatVal === 'online'
          ? ['zoom1','zoom2','zoom3','zoom4','zoom5','zoom6','zoom7','zoom8']
          : ['office','room2','room3','room4','room5'];
        const free = roomCandidates.filter(r => {
          for (const t of allTeachers) {
            const busy = getScheduleForDay(t, pendingDropTarget.day).some(s =>
              s.id !== selectedItem.id &&
              (s.classroom === r || s.zoomRoom === r) &&
              parseTime(s.startTime) < parseTime(newEnd) &&
              parseTime(s.endTime) > parseTime(newStart)
            );
            if (busy) return false;
          }
          return true;
        });
        const suggestedRoom = free.length > 0 ? free[0] : undefined;

        applyMove(selectedItem, pendingDropTarget.teacherId, pendingDropTarget.day, newStart, newEnd, recurrenceEditAction, suggestedRoom);
        setPendingDropTarget(null);
      } else {
        setBulkActionOpen(true);
      }
    }
    setRecurrenceEditOpen(false);
  };

  const handleSaveComment = () => {
    if (!selectedItem || !commentText.trim()) return;
    setIndividualLessons(prev =>
      prev.map(l => l.id === selectedItem.id ? { ...l, comment: commentText } : l)
    );
    allTeachers.forEach(t => {
      t.schedule = t.schedule.map(s =>
        s.id === selectedItem.id ? { ...s, comment: commentText } : s
      );
    });
    setCommentDialogOpen(false);
    setCommentText('');
  };

  const handleCellComment = () => {
    if (!commentSlot || !commentText.trim()) return;
    const newComment: CellComment = {
      id: generateId(),
      weekStart: weekKey,
      teacherId: commentSlot.teacherId,
      dayIndex: commentSlot.dayIndex,
      slotIndex: commentSlot.slotIndex,
      authorId: 'admin',
      authorName: 'Администратор',
      text: commentText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    saveComments(weekKey, updated);
    setCommentDialogOpen(false);
    setCommentText('');
    setCommentSlot(null);
  };

  const handleSaveTeacherComment = () => {
    if (!teacherCommentTarget || !teacherCommentText.trim()) return;
    const newComment: TeacherComment = {
      id: generateId(),
      teacherId: teacherCommentTarget,
      weekStart: weekKey,
      authorId: 'admin',
      authorName: 'Администратор',
      text: teacherCommentText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...teacherComments, newComment];
    setTeacherComments(updated);
    saveTeacherComments(weekKey, updated);
    setTeacherCommentDialogOpen(false);
    setTeacherCommentText('');
    setTeacherCommentTarget(null);
  };

  // ========== Drag & Drop handlers ==========
  const handleDragStart = (e: React.DragEvent, item: TeacherScheduleItem) => {
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDragItem(null);
    setDragOverSlot(null);
    setDragValid(null);
  };

  const handleDragOver = (e: React.DragEvent, teacherId: string, day: Date, slotStart: number) => {
    e.preventDefault();
    const slot = { teacherId, day, startMinutes: slotStart };
    setDragOverSlot(slot);

    if (dragItem) {
      const teacher = allTeachers.find(t => t.user.id === teacherId);
      const onVacation = teacher ? isTeacherOnVacation(teacher, day) : false;
      const duration = differenceInMinutes(
        parse(dragItem.endTime, 'HH:mm', new Date()),
        parse(dragItem.startTime, 'HH:mm', new Date())
      );
      const dropStart = slotStart / 60;
      const dropEnd = (slotStart + duration) / 60;
      let conflict = onVacation;
      if (!conflict && teacher) {
        conflict = getScheduleForDay(teacher, day).some(s =>
          s.id !== dragItem.id &&
          parseTime(s.startTime) < dropEnd &&
          parseTime(s.endTime) > dropStart
        );
      }
      // Room conflict
      if (!conflict && (dragItem.classroom || dragItem.zoomRoom)) {
        const roomKey = dragItem.classroom || dragItem.zoomRoom!;
        for (const t of allTeachers) {
          const roomConflict = getScheduleForDay(t, day).some(s =>
            s.id !== dragItem.id &&
            (s.classroom === roomKey || s.zoomRoom === roomKey) &&
            parseTime(s.startTime) < dropEnd &&
            parseTime(s.endTime) > dropStart
          );
          if (roomConflict) { conflict = true; break; }
        }
      }
      setDragValid(!conflict);
    }
  };

  const handleDrop = (e: React.DragEvent, teacherId: string, day: Date, slotStart: number) => {
    e.preventDefault();
    if (!dragItem || dragValid === false) {
      setDragItem(null);
      setDragOverSlot(null);
      return;
    }

    const duration = differenceInMinutes(
      parse(dragItem.endTime, 'HH:mm', new Date()),
      parse(dragItem.startTime, 'HH:mm', new Date())
    );
    const newStart = formatTimeFromMinutes(slotStart);
    const newEnd = formatTimeFromMinutes(slotStart + duration);

    // Conflict check at new position
    const teacher = allTeachers.find(t => t.user.id === teacherId);
    const onVacation = teacher ? isTeacherOnVacation(teacher, day) : false;
    let hasConflict = onVacation;
    if (!hasConflict && teacher) {
      const conflicts = getScheduleForDay(teacher, day).some(s =>
        s.id !== dragItem.id &&
        parseTime(s.startTime) < parseTime(newEnd) &&
        parseTime(s.endTime) > parseTime(newStart)
      );
      hasConflict = conflicts;
    }
    // Room conflict check
    if (!hasConflict && (dragItem.classroom || dragItem.zoomRoom)) {
      const roomKey = dragItem.classroom || dragItem.zoomRoom!;
      for (const t of allTeachers) {
        const roomConflict = getScheduleForDay(t, day).some(s =>
          s.id !== dragItem.id &&
          (s.classroom === roomKey || s.zoomRoom === roomKey) &&
          parseTime(s.startTime) < parseTime(newEnd) &&
          parseTime(s.endTime) > parseTime(newStart)
        );
        if (roomConflict) { hasConflict = true; break; }
      }
    }

    // Revert if conflict
    if (hasConflict) {
      setDragItem(null);
      setDragOverSlot(null);
      return;
    }

    // Auto-suggest room for new time slot
    const formatVal = dragItem.format || (teacher?.user.id ? 'offline' : 'offline');
    const OFFLINE_ROOMS_LIST = ['office', 'room2', 'room3', 'room4', 'room5'];
    const ONLINE_ROOMS_LIST = ['zoom1', 'zoom2', 'zoom3', 'zoom4', 'zoom5', 'zoom6', 'zoom7', 'zoom8'];
    const candidates = formatVal === 'online' ? ONLINE_ROOMS_LIST : OFFLINE_ROOMS_LIST;
    const freeRooms = candidates.filter(room => {
      for (const t of allTeachers) {
        const busy = getScheduleForDay(t, day).some(s =>
          s.id !== dragItem.id &&
          (s.classroom === room || s.zoomRoom === room) &&
          parseTime(s.startTime) < parseTime(newEnd) &&
          parseTime(s.endTime) > parseTime(newStart)
        );
        if (busy) return false;
      }
      return true;
    });
    const suggestedRoom = freeRooms.length > 0 ? freeRooms[0] : undefined;

    // Store pending drop info for confirmation dialog
    setPendingDropTarget({ teacherId, day, slotStart });
    setDropConfirmItem({ item: dragItem, newStart, newEnd, suggestedRoom });
    setDropConfirmOpen(true);
    setDragItem(null);
    setDragOverSlot(null);
    setDragValid(null);
  };

  const applyMove = (
    item: TeacherScheduleItem, teacherId: string, day: Date,
    newStart: string, newEnd: string, scope: 'this' | 'future' | 'all',
    suggestedRoom?: string
  ) => {
    const room = suggestedRoom || item.classroom || item.zoomRoom;
    const isRealItem = item.id.startsWith('real_si_');

    // Update DataStore for real_si_ items
    if (isRealItem) {
      const store = DataStore.getInstance();
      const [newH, newM] = newStart.split(':').map(Number);
      const [endH, endM] = newEnd.split(':').map(Number);
      const newDateStart = new Date(day);
      newDateStart.setHours(newH, newM, 0, 0);
      const newDateEnd = new Date(day);
      newDateEnd.setHours(endH, endM, 0, 0);

      const existing = store.getScheduleItem(item.id);
      if (existing) {
        store.updateScheduleItem(existing.id, {
          teacherId,
          start: newDateStart,
          end: newDateEnd,
          roomId: room?.startsWith('zoom') ? undefined : room,
          zoomRoomId: room?.startsWith('zoom') ? room : undefined,
        });
      } else {
        // Fallback — create new DataStore item
        store.addScheduleItem({
          id: item.id,
          teacherId,
          groupId: item.group?.id,
          start: newDateStart,
          end: newDateEnd,
          lessonType: item.type as NormalizedTeacherScheduleItem['lessonType'],
          status: item.status,
          commentIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          groupName: item.groupName,
          groupLevel: item.groupLevel,
          groupLanguage: item.groupLanguage,
          courseType: item.courseType,
          teacherName: item.teacherName,
          studentName: item.studentName,
        } as NormalizedTeacherScheduleItem);
      }
    }

    const shouldUpdate = (s: TeacherScheduleItem) => {
      if (s.id === item.id) return true;
      if (scope === 'this') return false;
      if (s.recurrenceId && s.recurrenceId === item.recurrenceId) {
        if (scope === 'all') return true;
        if (scope === 'future' && s.date >= item.date) return true;
      }
      // Fallback: match by same recurrenceRule frequency (legacy data without recurrenceId)
      if (scope === 'all' && s.recurrenceRule && item.recurrenceRule &&
        s.recurrenceRule.frequency === item.recurrenceRule.frequency) return true;
      if (scope === 'future' && s.recurrenceRule && item.recurrenceRule &&
        s.recurrenceRule.frequency === item.recurrenceRule.frequency &&
        s.date >= item.date) return true;
      return false;
    };

    if (isRealItem) {
      // For DataStore items, no need to update teacher.schedule — just update individualLessons if scope covers them
      setIndividualLessons(prev =>
        prev.map(l => {
          if (shouldUpdate(l)) {
            return {
              ...l,
              teacherId,
              date: day,
              startTime: newStart,
              endTime: newEnd,
              classroom: room?.startsWith('zoom') ? undefined : room,
              zoomRoom: room?.startsWith('zoom') ? room : undefined,
            };
          }
          return l;
        })
      );
    } else {
      setIndividualLessons(prev =>
        prev.map(l => {
          if (shouldUpdate(l)) {
            return {
              ...l,
              teacherId,
              date: day,
              startTime: newStart,
              endTime: newEnd,
              classroom: room?.startsWith('zoom') ? undefined : room,
              zoomRoom: room?.startsWith('zoom') ? room : undefined,
            };
          }
          return l;
        })
      );
    }
  };

  // ========== Resize handlers ==========
  const commitResize = (item: TeacherScheduleItem, newEndTime: string) => {
    const isGroupLesson = item.type === 'lesson';
    if (isGroupLesson) {
      allTeachers.forEach(t => {
        t.schedule = t.schedule.map(s =>
          s.id === item.id ? { ...s, endTime: newEndTime } : s
        );
      });
    } else {
      setIndividualLessons(prev =>
        prev.map(l => l.id === item.id ? { ...l, endTime: newEndTime } : l)
      );
    }
  };

  const handleResizeStart = (e: React.MouseEvent, item: TeacherScheduleItem) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const origStartMin = parseTime(item.startTime) * 60;
    const origEndMin = parseTime(item.endTime) * 60;
    const origDuration = origEndMin - origStartMin;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMin = Math.round(deltaY / (SLOT_HEIGHT / 60) / 15) * 15;
      const newDuration = Math.max(30, origDuration + deltaMin);
      const newEndMin = Math.round(origStartMin + newDuration);
      const newEndTime = formatTimeFromMinutes(newEndMin);
      pendingResizeRef.current = { endTime: newEndTime };
      setResizePreview({ id: item.id, endTime: newEndTime });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const final = pendingResizeRef.current;
      pendingResizeRef.current = null;
      if (final && final.endTime !== item.endTime) {
        commitResize(item, final.endTime);
      }
      setResizePreview(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // ========== Пересчет ширины колонок под FullHD ==========
  const teachersToShow = selectedTeacher === 'all'
    ? allTeachers
    : allTeachers.filter(t => t.user.id === selectedTeacher);

  const filteredTeachers = teachersToShow.filter(teacher => {
    if (filterLanguage !== 'all') {
      const langMap: Record<string, string> = { german: 'German', english: 'English' };
      if (!teacher.languages.includes((langMap[filterLanguage] || filterLanguage) as 'German' | 'English')) return false;
    }
    return true;
  });

  const availableWidth = 1920 - 64 - 48; // viewport - time column - paddings
  const columnWidth = Math.max(
    100,
    Math.min(
      160,
      Math.floor(availableWidth / Math.max(filteredTeachers.length, 1))
    )
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = viewMode === 'day'
    ? [currentDate]
    : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const slots = Array.from(
    { length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES },
    (_, i) => START_HOUR + (i * SLOT_MINUTES) / 60
  );

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 1);
        return d;
      });
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };
  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 1);
        return d;
      });
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };
  const handleToday = () => setCurrentDate(new Date());

  const rangeText = viewMode === 'day'
    ? format(currentDate, 'd MMMM yyyy', { locale: ru })
    : `${format(weekStart, 'd', { locale: ru })} \u2013 ${format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: ru })}`;

  const getAllScheduleItems = (teacher: Teacher, day: Date): TeacherScheduleItem[] => {
    const store = DataStore.getInstance();
    const storeItems = store.getAllScheduleItems().filter(si =>
      si.teacherId === teacher.user.id && isSameDay(si.start, day)
    );
    const dsItems: TeacherScheduleItem[] = storeItems.map(si => {
      const rg = si.groupId ? realGroups.find(g => g.id === si.groupId) : undefined;
      const startTime = `${String(si.start.getHours()).padStart(2,'0')}:${String(si.start.getMinutes()).padStart(2,'0')}`;
      const endTime = `${String(si.end.getHours()).padStart(2,'0')}:${String(si.end.getMinutes()).padStart(2,'0')}`;
      const effectiveStatus = si.status in STATUS_MAP
        ? si.status as ScheduleStatus
        : rg?.status === 'active'
          ? 'group_start' as ScheduleStatus
          : 'unavailable' as ScheduleStatus;
      return {
        id: si.id,
        groupId: si.groupId,
        teacherId: si.teacherId,
        date: si.start,
        startTime,
        endTime,
        type: si.lessonType as TeacherScheduleItem['type'],
        status: effectiveStatus,
        previousStatus: si.previousStatus as ScheduleStatus | undefined,
        group: rg ? {
          id: rg.id,
          name: si.groupName || rg.name,
          language: (si.groupLanguage || rg.language) as 'German' | 'English',
          level: (si.groupLevel || rg.level) as Group['level'],
          teacher: { id: rg.teacherId || si.teacherId, name: si.teacherName || rg.teacherName, email: '', phone: '', role: 'teacher' },
          schedule: rg.schedule,
          startDate: rg.startDate,
          endDate: rg.endDate,
          status: rg.status,
          students: [],
          maxStudents: 0,
          price: rg.price,
        } : undefined,
        format: si.format === 'hybrid' ? 'offline' : (si.format as 'online' | 'offline' || 'offline'),
        classroom: si.classroomName || si.roomId || undefined,
        zoomRoom: si.classroomName ? undefined : si.zoomRoomId || undefined,
        studentName: si.studentName || si.groupName,
        studentId: si.studentId,
        // Flat display fields from ScheduleItem
        groupName: si.groupName,
        groupLevel: si.groupLevel,
        groupLanguage: si.groupLanguage,
        courseType: si.courseType,
        teacherName: si.teacherName,
        capacity: si.capacity,
        currentStudents: si.currentStudents,
        paymentType: si.paymentType,
        packageSize: si.packageSize,
        completedCount: si.completedCount,
      };
    });
    const indivItems = individualLessons.filter(l =>
      isSameDay(l.date, day) && (!l.teacherId || l.teacherId === teacher.user.id)
    );
    return [...dsItems, ...indivItems].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Расписание</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 h-8"><Plus className="h-3.5 w-3.5" />Создать занятие</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base">Создание занятия</DialogTitle>
                <DialogDescription className="sr-only">
                    Форма создания нового занятия в расписании преподавателя
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {cfErrors.length > 0 && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-2 space-y-2">
                    {cfErrors.map((e, i) => {
                      const lines = e.split('\n');
                      return (
                        <div key={i} className="text-xs text-red-700">
                          {lines.map((line, j) => (
                            <p key={j} className={j === 0 ? 'font-semibold' : ''}>{j > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle" />}{line}</p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    className={`flex-1 py-1.5 text-xs font-medium ${createType === 'individual' ? 'bg-blue-50 text-blue-700' : 'bg-white text-muted-foreground'}`}
                    onClick={() => setCreateType('individual')}
                  >
                    Индивидуальное
                  </button>
                  <button
                    className={`flex-1 py-1.5 text-xs font-medium ${createType === 'testing' ? 'bg-blue-50 text-blue-700' : 'bg-white text-muted-foreground'}`}
                    onClick={() => setCreateType('testing')}
                  >
                    Тестирование
                  </button>
                  <button
                    className={`flex-1 py-1.5 text-xs font-medium ${createType === 'trial' ? 'bg-blue-50 text-blue-700' : 'bg-white text-muted-foreground'}`}
                    onClick={() => setCreateType('trial')}
                  >
                    Пробный урок
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Преподаватель</Label>
                    <Select value={cfTeacher} onValueChange={(v) => {
                      setCfTeacher(v);
                      const t = allTeachers.find(te => te.user.id === v);
                      if (t) setCfLanguage(t.languages[0]);
                    }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>
                        {allTeachers
                          .filter(t => t.languages.includes(cfLanguage))
                          .map(t => <SelectItem key={t.user.id} value={t.user.id}>{t.user.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Дата</Label>
                    <Input type="date" className="h-7 text-xs" value={cfDate} onChange={e => setCfDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Время начала</Label>
                    <Input type="time" className="h-7 text-xs" value={cfTime} onChange={e => setCfTime(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Длительность</Label>
                    <Select value={cfDuration} onValueChange={setCfDuration}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 мин</SelectItem>
                        <SelectItem value="45">45 мин</SelectItem>
                        <SelectItem value="60">60 мин</SelectItem>
                        <SelectItem value="90">90 мин</SelectItem>
                        <SelectItem value="120">120 мин</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {createType === 'individual' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Ученик</Label>
                        <Select value={cfStudent} onValueChange={setCfStudent}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Выберите ученика" /></SelectTrigger>
                          <SelectContent>
                            {allStudents.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Повторение</Label>
                        <Select value={cfRepeat} onValueChange={setCfRepeat}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не повторять</SelectItem>
                            <SelectItem value="weekly">Каждую неделю</SelectItem>
                            <SelectItem value="biweekly">Каждые две недели</SelectItem>
                            <SelectItem value="monthly">Каждый месяц</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Язык</Label>
                      <Select value={cfLanguage} onValueChange={(v) => setCfLanguage(v as 'German' | 'English')}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="German">Немецкий</SelectItem>
                          <SelectItem value="English">Английский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {createType === 'individual' && (
                  <div className="space-y-2 bg-muted p-2 rounded border border-border">
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="paymentType" value="single" checked={cfPaymentType === 'single'}
                          onChange={() => setCfPaymentType('single')} className="accent-teal-500" />
                        <span className="text-[11px] text-foreground">Разовая оплата</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="paymentType" value="package" checked={cfPaymentType === 'package'}
                          onChange={() => setCfPaymentType('package')} className="accent-teal-500" />
                        <span className="text-[11px] text-foreground">Абонемент</span>
                      </label>
                    </div>
                    {cfPaymentType === 'package' && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {['8', '12', '16', '20'].map(n => (
                          <button key={n} type="button"
                            className={`px-2.5 py-1 text-[11px] rounded border ${cfPackageSize === n ? 'bg-teal-100 border-teal-400 text-teal-800' : 'bg-white border-border text-muted-foreground hover:bg-muted'}`}
                            onClick={() => setCfPackageSize(n)}
                          >{n}</button>
                        ))}
                        <input type="number" min="1" max="100" placeholder="Своё"
                          className="w-14 h-6 text-[11px] px-1 border rounded border-border"
                          value={!['8', '12', '16', '20'].includes(cfPackageSize) ? cfPackageSize : ''}
                          onChange={e => setCfPackageSize(e.target.value || '1')}
                          onFocus={() => setCfPackageSize('')} />
                      </div>
                    )}
                  </div>
                )}

                {(createType === 'testing' || createType === 'trial') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Ученик</Label>
                      <Select value={cfStudent} onValueChange={setCfStudent}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Выберите ученика" /></SelectTrigger>
                        <SelectContent>
                          {allStudents.filter(s => s.status === 'active').map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Язык</Label>
                      <Select value={cfLanguage} onValueChange={(v) => setCfLanguage(v as 'German' | 'English')}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="German">Немецкий</SelectItem>
                          <SelectItem value="English">Английский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Формат</Label>
                    <Select value={cfFormat} onValueChange={(v) => { setCfFormat(v); setCfRoom('auto'); }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offline">Офлайн</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">{cfFormat === 'online' ? 'Zoom' : 'Кабинет / аудитория'}</Label>
                    {availableRooms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {availableRooms.map(room => (
                          <button key={room} type="button"
                            className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition-colors ${
                              cfRoom === room
                                ? 'bg-teal-100 border-teal-400 text-teal-800'
                                : 'bg-white border-border text-muted-foreground hover:bg-muted'
                            }`}
                            onClick={() => { setCfRoom(room); }}
                          >
                            <span className="text-[10px]">{cfRoom === room ? '✓' : ''}</span>
                            {formatRoomKey(room)}
                          </button>
                        ))}
                      </div>
                    ) : cfTeacher && cfDate && cfTime ? (
                      <div className="text-[11px] text-red-500 py-1">
                        {cfFormat === 'online' ? 'Нет свободных Zoom' : 'Нет свободных аудиторий'}
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground py-1">Укажите преподавателя, дату и время</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Комментарий</Label>
                  <Textarea className="text-xs min-h-[50px]" placeholder="Комментарий к занятию..." value={cfComment} onChange={e => setCfComment(e.target.value)} />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setCreateOpen(false); setCfErrors([]); setAvailableRooms([]); }}>Отмена</Button>
                  <Button size="sm" className="h-7 text-xs" disabled={cfErrors.length > 0} onClick={handleCreate}>Создать</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handlePrevious}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-medium" onClick={handleToday}>
              Сегодня
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleNext}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold text-foreground">{rangeText}</h2>
        </div>

        <div className="flex items-center gap-1 border rounded-md overflow-hidden">
          <button
            className={`px-2.5 py-1 text-[11px] font-medium ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-muted-foreground hover:bg-muted'}`}
            onClick={() => setViewMode('week')}
          >
            Неделя
          </button>
          <button
            className={`px-2.5 py-1 text-[11px] font-medium ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-muted-foreground hover:bg-muted'}`}
            onClick={() => setViewMode('day')}
          >
            День
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="w-[110px] h-7 text-xs">
              <SelectValue placeholder="Все языки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все языки</SelectItem>
              <SelectItem value="German">Немецкий</SelectItem>
              <SelectItem value="English">Английский</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterClassroom} onValueChange={setFilterClassroom}>
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <SelectValue placeholder="Все локации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все локации</SelectItem>
              <SelectItem value="office">Офис</SelectItem>
              <SelectItem value="room2">2</SelectItem>
              <SelectItem value="room3">3</SelectItem>
              <SelectItem value="room4">4</SelectItem>
              <SelectItem value="room5">5</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="w-[150px] h-7 text-xs">
              <SelectValue placeholder="Все преподаватели" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все преподаватели</SelectItem>
              {allTeachers.map(t => (
                <SelectItem key={t.user.id} value={t.user.id}>{t.user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setCreateGroupOpen(true)}>
            + Группа
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0 overflow-auto scroll-smooth" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          <div ref={gridRef} className="min-w-fit">
            {/* Teacher headers */}
            <div className="flex border-b border-border sticky top-0 z-30 bg-white">
              <div
                className="shrink-0 border-r border-border bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground sticky left-0 z-30"
                style={{ width: 64, height: DAY_HEADER_HEIGHT * 1.6 }}
              >
                Время
              </div>
              {filteredTeachers.map(teacher => {
                const nameParts = teacher.user.name.split(' ');
                const teacherColComments = teacherComments.filter(c => c.teacherId === teacher.user.id && c.text?.trim());
                return (
                  <div
                    key={teacher.user.id}
                    className="shrink-0 border-r border-border p-1 text-center bg-muted flex flex-col items-center justify-center relative"
                    style={{ width: columnWidth, height: DAY_HEADER_HEIGHT * 1.6 }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setTeacherContextMenuPos({ x: e.clientX, y: e.clientY, teacherId: teacher.user.id });
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {teacher.weeklyNote && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <StickyNote className="h-2.5 w-2.5 text-amber-500 cursor-pointer shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[180px] bg-slate-800 text-white text-[10px]">
                              <p>{teacher.weeklyNote}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="leading-tight text-center">
                      {nameParts.length > 1 ? (
                        <>
                          <div className="text-[10px] font-medium text-foreground leading-tight">{nameParts[0]}</div>
                          <div className="text-[9px] text-muted-foreground leading-tight">{nameParts.slice(1).join(' ')}</div>
                        </>
                      ) : (
                        <span className="text-[10px] font-medium text-foreground">{teacher.user.name}</span>
                      )}
                    </div>
                    {teacherColComments.length > 0 && (
                      <div className="absolute top-0.5 right-0.5 z-10">
                        <HoverCard openDelay={200} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button className="flex items-center gap-0.5 cursor-default">
                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded leading-none py-0.5">{teacherColComments.length}</span>
                              <MessageSquare className="h-2.5 w-2.5 text-amber-500" />
                            </button>
                          </HoverCardTrigger>
                          <HoverCardContent side="bottom" align="start" className="w-72 p-0 bg-white border shadow-xl rounded-lg overflow-hidden">
                            <div className="max-h-48 overflow-y-auto p-2 space-y-2">
                              {teacherColComments.map(c => (
                                <div key={c.id} className="flex gap-2 p-1.5 rounded hover:bg-muted group">
                                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0 mt-0.5">
                                    {c.authorName.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xs font-semibold text-foreground">{c.authorName}</span>
                                      <span className="text-[9px] text-muted-foreground">{format(c.createdAt, 'HH:mm')} {format(c.createdAt, 'd MMM', { locale: ru })}</span>
                                    </div>
                                    <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap">{c.text}</p>
                                    {c.replies && c.replies.map(r => (
                                      <div key={r.id} className="flex gap-2 mt-1.5 pl-2 border-l-2 border-border">
                                        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[6px] font-bold text-blue-700 shrink-0 mt-0.5">
                                          {r.authorName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-baseline gap-1">
                                            <span className="text-[9px] font-semibold text-foreground">{r.authorName}</span>
                                            <span className="text-[7px] text-muted-foreground">{format(r.createdAt, 'HH:mm')} {format(r.createdAt, 'd MMM', { locale: ru })}</span>
                                          </div>
                                          <p className="text-[10px] text-foreground">{r.text}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-border/50 p-1.5 bg-muted">
                              <button
                                className="text-[10px] text-teal-600 hover:text-teal-700 font-medium w-full text-center"
                                onClick={() => {
                                  setTeacherCommentTarget(teacher.user.id);
                                  setTeacherCommentText('');
                                  setTeacherCommentDialogOpen(true);
                                }}
                              >
                                + Добавить комментарий
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Days + Time slots */}
            {weekDays.map((day, dayIndex) => {
              const isToday = isSameDay(day, new Date());
              const isSun = isSunday(day);
              const holidayName = isHoliday(day);
              const isOffDay = isSun || !!holidayName;

              return (
                <div key={dayIndex} className="flex border-b border-border relative">
                  {/* Time column */}
                  <div
                    className="shrink-0 border-r border-border bg-muted flex flex-col sticky left-0 z-20"
                    style={{ width: 64 }}
                  >
                    <div
                      className={`border-b border-border flex items-center justify-center ${
                        isToday ? 'bg-blue-50' : isOffDay ? 'bg-muted' : ''
                      }`}
                      style={{ height: DAY_HEADER_HEIGHT }}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${
                        isToday ? 'text-blue-700' : isOffDay ? 'text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {dayNames[getMondayFirstDayIndex(day)]}
                      </span>
                    </div>
                    {/* Time slots — hourly labels */}
                    {slots.map(slot => {
                      const isCurrentHour = isToday && Math.floor(slot) === new Date().getHours();
                      return (
                        <div
                          key={slot}
                          className={`border-b ${isCurrentHour ? 'border-blue-300 bg-blue-50' : 'border-border'}`}
                          style={{ height: SLOT_HEIGHT }}
                        >
                          <span className={`text-xs font-medium px-1 ${isCurrentHour ? 'text-blue-700 font-bold' : 'text-muted-foreground'}`}>
                            {Math.floor(slot).toString().padStart(2, '0')}:00
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Current time indicator (across all teacher columns) */}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{
                        top: DAY_HEADER_HEIGHT + (new Date().getHours() - START_HOUR + new Date().getMinutes() / 60) * SLOT_HEIGHT,
                        height: 0,
                      }}
                    >
                      <div className="relative" style={{ marginLeft: -64 }}>
                        <div className="border-t-2 border-red-500" />
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                      </div>
                    </div>
                  )}

                  {/* Teacher columns */}
                  {filteredTeachers.map(teacher => {
                    const dayItems = getAllScheduleItems(teacher, day);
                    const onVacation = isTeacherOnVacation(teacher, day);
                    const colComments = comments.filter(
                      c => c.teacherId === teacher.user.id && c.dayIndex === dayIndex
                    );

                    return (
                      <div
                        key={teacher.user.id}
                        className={`shrink-0 border-r border-border relative ${
                          onVacation ? 'bg-teal-50/40' : isOffDay ? 'bg-muted/50' : ''
                        } ${isToday ? 'bg-blue-50/20' : ''}`}
                        style={{ width: columnWidth }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setCommentSlot({ teacherId: teacher.user.id, dayIndex, slotIndex: 0 });
                          setCommentText('');
                          setCommentDialogOpen(true);
                        }}
                      >
                        {/* Day header */}
                        <div
                          className={`flex items-center justify-center border-b-2 ${
                            isToday ? 'bg-blue-50 border-blue-200' : isOffDay ? 'bg-muted border-slate-300' : 'bg-white border-border'
                          }`}
                          style={{ height: DAY_HEADER_HEIGHT }}
                        >
                          <div className="text-center">
                            <p className={`text-[10px] font-bold leading-tight ${isToday ? 'text-blue-700' : isOffDay ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {format(day, 'd.MM')}
                            </p>
                          </div>
                          {holidayName && (
                            <span className="text-[7px] text-muted-foreground ml-1">{holidayName}</span>
                          )}
                          {isSun && !holidayName && (
                            <span className="text-[7px] text-muted-foreground ml-1">Вых.</span>
                          )}
                        </div>

                        {/* Grid lines — hourly */}
                        <div className="absolute left-0 right-0 bottom-0" style={{ top: DAY_HEADER_HEIGHT }}>
                          {slots.map(slot => {
                            const isCurrentHour = isToday && Math.floor(slot) === new Date().getHours();
                            return (
                              <div
                                key={slot}
                                className={`border-b ${isCurrentHour ? 'border-blue-200 border-b-2' : 'border-border'}`}
                                style={{ height: SLOT_HEIGHT }}
                              />
                            );
                          })}
                        </div>

                        {/* Clickable empty cells */}
                        <div className="absolute left-0 right-0 bottom-0" style={{ top: DAY_HEADER_HEIGHT }}>
                          {slots.map((slot) => (
                            <div
                              key={`slot-${slot}`}
                              className={`border-b border-border transition-colors ${
                                dragOverSlot?.teacherId === teacher.user.id &&
                                isSameDay(dragOverSlot.day, day) &&
                                Math.abs(dragOverSlot.startMinutes - slot * 60) < 30
                                  ? dragValid
                                    ? 'bg-green-100/50'
                                    : 'bg-red-100/50'
                                  : 'hover:bg-muted/50'
                              }`}
                              style={{ height: SLOT_HEIGHT }}
                              onClick={() => {
                                setSelectedSlot({ teacherId: teacher.user.id, day, slot });
                                setSelectedItem(null);
                                setCreateOpen(true);
                              }}
                              onDragOver={(e) => handleDragOver(e, teacher.user.id, day, Math.round(slot * 60))}
                              onDrop={(e) => handleDrop(e, teacher.user.id, day, Math.round(slot * 60))}
                              title={`${teacher.user.name} — ${format(day, 'd.MM')} ${Math.floor(slot).toString().padStart(2, '0')}:00`}
                            />
                          ))}
                        </div>

                        {/* Comment indicators (triangles) */}
                        {colComments.length > 0 && (
                          <div className="absolute top-1 right-0 z-20">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-0 h-0 cursor-pointer"
                                    style={{
                                      borderLeft: '8px solid transparent',
                                      borderRight: '8px solid #F59E0B',
                                      borderBottom: '8px solid transparent',
                                      transform: 'rotate(90deg)',
                                    }}
                                    onClick={() => {
                                      setCommentSlot({ teacherId: teacher.user.id, dayIndex, slotIndex: 0 });
                                      setCommentText(colComments[0].text);
                                      setCommentDialogOpen(true);
                                    }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[220px] bg-white border shadow-lg p-2">
                                  {colComments.map(c => (
                                    <div key={c.id} className="text-[10px] text-foreground mb-1 last:mb-0">
                                      <p className="font-medium text-foreground">{c.authorName}</p>
                                      <p className="text-muted-foreground">{format(c.createdAt, 'dd.MM.yyyy HH:mm')}</p>
                                      <p className="mt-0.5">{c.text}</p>
                                    </div>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}

                        {/* Schedule items */}
                        {dayItems.map(item => {
                          const effectiveStatus = item.status === 'cancelled' ? 'cancelled' :
                            onVacation && item.status !== 'replacement' ? 'needs_replacement' :
                            item.status;

                          const style = getStatusStyle(effectiveStatus);
                          const typeColor = getScheduleCardColors(item.type, item.format, effectiveStatus);
                          const start = parseTime(item.startTime);
                          const displayEndStr = resizePreview?.id === item.id ? resizePreview.endTime : item.endTime;
                          const end = parseTime(displayEndStr);
                          const top = DAY_HEADER_HEIGHT + (start - START_HOUR) * (60 / SLOT_MINUTES) * SLOT_HEIGHT;
                          const height = Math.max((end - start) * (60 / SLOT_MINUTES) * SLOT_HEIGHT, 24);
                          const studentCount = item.currentStudents ?? 0;
                          const maxStudents = item.capacity ?? 0;
                          const room = formatRoomKey(item.classroom || item.zoomRoom) || (item.format === 'online' ? 'Online' : '');
                          const level = item.groupLevel || '';
                          const groupName = item.groupName || '';
                          const active = isCurrentTime(day, start, end);
                          const isCancelled = item.status === 'cancelled';
                          const hasLessonComment = !!item.comment;
                          const isPast = day < new Date(new Date().toDateString()) && !isSameDay(day, new Date());
                          const isUpcoming = !isPast && !active && !isCancelled && isSameDay(day, new Date());

                          const bgColor = typeColor.bg;
                          const borderColor = active ? '#EF4444' : typeColor.border;
                          const textColor = typeColor.text;

                          return (
                            <div key={item.id}>
                              <div
                                className={`absolute left-0.5 right-0.5 rounded border overflow-hidden text-[11px] leading-snug cursor-pointer transition-all z-[5] ${
                                  active ? 'ring-1 ring-teal-400 bg-opacity-90' : ''
                                } hover:shadow-md hover:-translate-y-0.5 hover:z-10`}
                                style={{
                                  top: `${top}px`,
                                  height: `${Math.max(height, 26)}px`,
                                  backgroundColor: bgColor,
                                  borderColor: active ? '#5EEAD4' : borderColor,
                                  color: textColor,
                                  borderLeftWidth: '3px',
                                  borderLeftColor: active ? '#14B8A6' : typeColor.badge,
                                }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragEnd={handleDragEnd}
                                onContextMenu={(e) => handleContextMenu(e, item)}
                                onClick={() => setLessonInfoItem(item)}
                              >
                                <div className={`p-2 space-y-1 pointer-events-none ${isCancelled ? 'line-through relative' : ''}`}>
                                  {/* Top row: time + status badges */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <p className="font-bold text-[10px] shrink-0 tracking-tight">
                                      {item.startTime}–{item.endTime}
                                    </p>
                                    {active && (
                                      <span className="inline-flex items-center gap-0.5 text-[7px] font-medium text-teal-600 bg-teal-50 px-1.5 rounded leading-none py-0.5">
                                        <span className="w-1 h-1 rounded-full bg-teal-500 animate-pulse inline-block" />
                                        Сейчас
                                      </span>
                                    )}
                                    {isPast && !isCancelled && (
                                      <span className="text-[7px] text-muted-foreground px-1 leading-none">Завершено</span>
                                    )}
                                    {isUpcoming && (
                                      <span className="text-[7px] text-blue-500 font-medium px-1 leading-none">Предстоит</span>
                                    )}
                                    {item.format && (
                                      <span className={`text-[7px] font-bold px-1 leading-none ${item.format === 'online' ? 'text-purple-500' : 'text-amber-600'}`}>
                                        {item.format === 'online' ? 'ОН' : 'ОФ'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Progress bar for current lesson */}
                                  {active && (() => {
                                    const now = new Date();
                                    const lessonStart = parseTime(item.startTime);
                                    const lessonEnd = parseTime(item.endTime);
                                    const nowVal = now.getHours() + now.getMinutes() / 60;
                                    const progress = Math.min(100, Math.max(0, ((nowVal - lessonStart) / (lessonEnd - lessonStart)) * 100));
                                    return (
                                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-100">
                                        <div className="h-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
                                      </div>
                                    );
                                  })()}

                                  {/* Group name or student name */}
                                  {groupName && (
                                    <p className={`font-semibold text-[10px] leading-tight break-words whitespace-normal ${style.textClass || ''}`}>
                                      {groupName}
                                    </p>
                                  )}
                                  {item.type === 'individual' && item.studentName && (
                                    <p className="font-semibold text-[10px] leading-tight break-words whitespace-normal">{item.studentName}</p>
                                  )}
                                  {item.type === 'testing' && item.studentName && (
                                    <p className="font-semibold text-[10px] leading-tight break-words whitespace-normal">{item.studentName}</p>
                                  )}
                                  {item.type === 'trial' && item.studentName && (
                                    <p className="font-semibold text-[10px] leading-tight break-words whitespace-normal">{item.studentName}</p>
                                  )}

                                  {/* Type label + level */}
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[8px] opacity-80">{LESSON_TYPE_LABELS[item.type] || item.type}</span>
                                    {level && (
                                      <span className="text-[7px] opacity-60 bg-white/60 px-1 rounded">{level}</span>
                                    )}
                                  </div>

                                  {/* Room + student count */}
                                  <div className="flex items-center gap-2">
                                    {room && (
                                      <span className="text-[8px] opacity-80">{room}</span>
                                    )}
                                    {studentCount > 0 && (
                                      <span className="text-[8px] opacity-70">{studentCount}{maxStudents > 0 ? `/${maxStudents}` : ''} уч.</span>
                                    )}
                                  </div>

                                  {/* Package progress for individual */}
                                  {item.type === 'individual' && item.paymentType === 'package' && item.packageSize && (
                                    <div className="flex items-center gap-1">
                                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden" style={{ maxWidth: 40 }}>
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${Math.min(100, ((item.completedCount ?? 0) / item.packageSize) * 100)}%`,
                                            backgroundColor: typeColor.badge,
                                          }}
                                        />
                                      </div>
                                      <span className="text-[7px] opacity-70">{item.completedCount ?? 0}/{item.packageSize}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Comment indicator */}
                                {hasLessonComment && (
                                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 z-10" />
                                )}
                              </div>
                              {/* Resize handle */}
                              <div
                                className="absolute left-1.5 right-1.5 bottom-0 h-1.5 cursor-s-resize z-10 hover:bg-slate-400/20 rounded-b transition-colors"
                                style={{ top: `${top + height - 6}px` }}
                                onMouseDown={(e) => handleResizeStart(e, item)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ScheduleLessonDialog
        item={lessonInfoItem}
        onOpenChange={(open) => { if (!open) setLessonInfoItem(null); }}
      />

      {/* Context Menu */}
      {contextMenuPos && contextItem && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => { setContextMenuPos(null); setContextItem(null); }}
          />
          <div
            className="fixed z-40 bg-white rounded-lg shadow-lg border border-border py-1 w-48"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
              onClick={() => handleContextAction('edit')}
            >
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              Редактировать
            </button>
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
              onClick={() => handleContextAction('move')}
            >
              <Move className="h-3.5 w-3.5 text-muted-foreground" />
              Переместить
            </button>
            {contextItem.type === 'individual' && contextItem.paymentType === 'package' && contextItem.status !== 'cancelled' && (contextItem.completedCount ?? 0) < (contextItem.packageSize ?? 0) && (
              <button
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2 text-teal-600"
                onClick={() => handleContextAction('conduct')}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Отметить проведённым
              </button>
            )}
            <div className="border-t border-border/50 my-1" />
            {contextItem.status === 'cancelled' ? (
              <button
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2 text-green-600"
                onClick={() => handleContextAction('restore')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Восстановить занятие
              </button>
            ) : (
              <button
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2 text-amber-600"
                onClick={() => handleContextAction('cancel')}
              >
                <X className="h-3.5 w-3.5" />
                Отменить занятие
              </button>
            )}
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2 text-red-600"
              onClick={() => handleContextAction('delete')}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить занятие
            </button>
            <div className="border-t border-border/50 my-1" />
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
              onClick={() => handleContextAction('comment')}
            >
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Добавить комментарий
            </button>
          </div>
        </>
      )}

      {/* Teacher Context Menu */}
      {teacherContextMenuPos && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => { setTeacherContextMenuPos(null); }}
          />
          <div
            className="fixed z-40 bg-white rounded-lg shadow-lg border border-border py-1 w-48"
            style={{ left: teacherContextMenuPos.x, top: teacherContextMenuPos.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
              onClick={() => {
                setTeacherCommentTarget(teacherContextMenuPos.teacherId);
                setTeacherCommentText('');
                setTeacherCommentDialogOpen(true);
                setTeacherContextMenuPos(null);
              }}
            >
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              Добавить комментарий
            </button>
          </div>
        </>
      )}

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Комментарий</DialogTitle>
          </DialogHeader>
          <Textarea
            className="text-sm min-h-[80px]"
            placeholder="Введите комментарий..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setCommentDialogOpen(false)}>Отмена</Button>
            <Button size="sm" className="h-7 text-xs" onClick={selectedItem ? handleSaveComment : handleCellComment}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Comment Dialog — Google Sheets style */}
      <Dialog open={teacherCommentDialogOpen} onOpenChange={setTeacherCommentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Комментарии — {teacherCommentTarget ? allTeachers.find(t => t.user.id === teacherCommentTarget)?.user.name : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {teacherCommentTarget && teacherComments
              .filter(c => c.teacherId === teacherCommentTarget)
              .map(c => (
                <div key={c.id} className="flex gap-2 p-2 rounded-lg bg-muted relative group">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0 mt-0.5">
                    {c.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-foreground">{c.authorName}</span>
                      <span className="text-[9px] text-muted-foreground">{format(c.createdAt, 'HH:mm')} {format(c.createdAt, 'd MMM', { locale: ru })}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap">{c.text}</p>
                    {c.replies && c.replies.map(r => (
                      <div key={r.id} className="flex gap-2 mt-2 pl-4 border-l-2 border-border">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700 shrink-0 mt-0.5">
                          {r.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-semibold text-foreground">{r.authorName}</span>
                            <span className="text-[8px] text-muted-foreground">{format(r.createdAt, 'HH:mm')} {format(r.createdAt, 'd MMM', { locale: ru })}</span>
                          </div>
                          <p className="text-[10px] text-foreground">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 text-muted-foreground hover:text-red-500 transition-opacity"
                    onClick={() => {
                      const updated = teacherComments.filter(cc => cc.id !== c.id);
                      setTeacherComments(updated);
                      saveTeacherComments(weekKey, updated);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            {teacherCommentTarget && teacherComments.filter(c => c.teacherId === teacherCommentTarget).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Нет комментариев</p>
            )}
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0">
                А
              </div>
              <div className="flex-1 space-y-1">
                <Textarea
                  className="text-xs min-h-[40px] max-h-20"
                  placeholder="Добавить комментарий..."
                  value={teacherCommentText}
                  onChange={e => setTeacherCommentText(e.target.value)}
                />
                <div className="flex justify-end gap-1">
                  <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => { setTeacherCommentDialogOpen(false); setTeacherCommentText(''); }}>Отмена</Button>
                  <Button size="sm" className="h-6 text-[10px]" onClick={handleSaveTeacherComment}>Ответить</Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recurrence Edit Dialog (Google Calendar style) */}
      <AlertDialog open={recurrenceEditOpen} onOpenChange={setRecurrenceEditOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              {bulkActionType === 'cancel' ? 'Отменить занятие' : bulkActionType === 'delete' ? 'Удалить занятие' : bulkActionType === 'move' ? 'Перенести занятие' : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Это повторяющееся занятие. Что вы хотите сделать?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
              <input type="radio" name="recurrence" value="this" checked={recurrenceEditAction === 'this'}
                onChange={() => setRecurrenceEditAction('this')} className="accent-teal-500" />
              <span className="text-xs">Только это занятие</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
              <input type="radio" name="recurrence" value="future" checked={recurrenceEditAction === 'future'}
                onChange={() => setRecurrenceEditAction('future')} className="accent-teal-500" />
              <span className="text-xs">Это и все последующие</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
              <input type="radio" name="recurrence" value="all" checked={recurrenceEditAction === 'all'}
                onChange={() => setRecurrenceEditAction('all')} className="accent-teal-500" />
              <span className="text-xs">Все занятия серии</span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-7 text-xs">Отмена</AlertDialogCancel>
            <AlertDialogAction className="h-7 text-xs" onClick={handleRecurrenceEdit}>
              {bulkActionType === 'delete' ? 'Удалить' : bulkActionType === 'move' ? 'Перенести' : 'Отменить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk action confirmation */}
      <AlertDialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              {bulkActionType === 'cancel' && 'Отменить занятие'}
              {bulkActionType === 'delete' && 'Удалить занятие'}
              {bulkActionType === 'move' && 'Перенести занятие'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {bulkActionType === 'cancel' && (
                <>Занятие <strong>{selectedItem?.group?.name || selectedItem?.id || ''}</strong> {selectedItem?.startTime} – {selectedItem?.endTime} будет отменено.</>
              )}
              {bulkActionType === 'delete' && (
                <>Занятие <strong>{selectedItem?.group?.name || selectedItem?.id || ''}</strong> {selectedItem?.startTime} – {selectedItem?.endTime} будет удалено безвозвратно.</>
              )}
              {bulkActionType === 'move' && (
                <>Выберите новое время в расписании или задайте вручную.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-7 text-xs" onClick={() => setBulkActionOpen(false)}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className={`h-7 text-xs ${bulkActionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : bulkActionType === 'cancel' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={() => {
                if (bulkActionType === 'cancel') executeCancel();
                else if (bulkActionType === 'delete') executeDelete();
                else setBulkActionOpen(false);
              }}
            >
              {bulkActionType === 'cancel' && 'Отменить'}
              {bulkActionType === 'delete' && 'Удалить'}
              {bulkActionType === 'move' && 'Перенести'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
      />

      {/* Drop Confirmation Dialog */}
      {dropConfirmItem && (
        <DropConfirmDialog
          open={dropConfirmOpen}
          onOpenChange={setDropConfirmOpen}
          itemName={dropConfirmItem.item.groupName || dropConfirmItem.item.studentName || 'Занятие'}
          isRecurring={!!dropConfirmItem.item.recurrenceRule}
          onChangeAll={() => {
            const d = dropConfirmItem;
            setDropConfirmOpen(false);
            setDropConfirmItem(null);
            const scope = d.item.recurrenceRule ? 'future' : 'all';
            applyMove(d.item, pendingDropTarget!.teacherId, pendingDropTarget!.day, d.newStart, d.newEnd, scope, d.suggestedRoom);
            setPendingDropTarget(null);
          }}
          onChangeOne={() => {
            const d = dropConfirmItem;
            setDropConfirmOpen(false);
            setDropConfirmItem(null);
            applyMove(d.item, pendingDropTarget!.teacherId, pendingDropTarget!.day, d.newStart, d.newEnd, 'this', d.suggestedRoom);
            setPendingDropTarget(null);
          }}
          onCancel={() => {
            setDropConfirmOpen(false);
            setDropConfirmItem(null);
            setPendingDropTarget(null);
          }}
        />
      )}

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <button onClick={() => setShowLegend(false)} className="text-[10px] text-muted-foreground hover:text-muted-foreground mr-1">
            ✕
          </button>
          {Object.entries(STATUS_MAP).map(([key, s]) => (
            <div key={key} className="flex items-center gap-1">
              {key === 'recruiting' || key === 'cancelled' ? (
                <div
                  className={`flex h-3.5 w-5 items-center justify-center rounded-sm border bg-white text-[8px] font-bold ${key === 'cancelled' ? 'line-through' : ''}`}
                  style={{ borderColor: s.border, color: s.text }}
                >
                  Аа
                </div>
              ) : (
                <div className="h-2.5 w-2.5 rounded-sm border" style={{ backgroundColor: s.bg, borderColor: s.border }} />
              )}
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
