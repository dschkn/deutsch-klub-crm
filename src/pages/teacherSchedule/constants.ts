import { ScheduleStatus, TeacherScheduleItem } from '../../types';

export const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const LESSON_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  lesson:     { bg: '#FFFFFF', border: '#D1D5DB', text: '#1F2937', badge: '#9CA3AF' },
  individual: { bg: '#E8F5E9', border: '#A5D6A7', text: '#1B5E20', badge: '#4CAF50' },
  testing:    { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1', badge: '#2196F3' },
  trial:      { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1', badge: '#2196F3' },
  club:       { bg: '#FCE7F3', border: '#F9A8D4', text: '#9D174D', badge: '#EC4899' },
};

export const LESSON_TYPE_LABELS: Record<string, string> = {
  lesson: 'Групповое',
  individual: 'Индивид.',
  testing: 'Тест',
  trial: 'Пробный + консультация',
  club: 'Клуб',
  intensive: 'Интенсив',
  grammar: 'Грамматика',
  mini: 'Мини-группа',
  phonetics: 'Фонетика',
  open_lesson: 'Открытый урок',
  language_course: 'Курс',
};

export const START_HOUR = 8;
export const END_HOUR = 24;
export const SLOT_MINUTES = 60;
export const SLOT_HEIGHT = 60;
export const DAY_HEADER_HEIGHT = 36;

export const STATUS_MAP: Record<
  ScheduleStatus,
  { bg: string; border: string; text: string; label: string; textClass?: string }
> = {
  trial_lesson:       { bg: '#E0F7FA', border: '#B2EBF2', text: '#006064', label: 'Тестовое занятие' },
  group_start:        { bg: '#FFEBEE', border: '#EF9A9A', text: '#B71C1C', label: 'Старт группы' },
  needs_replacement:  { bg: '#FFF9C4', border: '#FFF59D', text: '#F57F17', label: 'Нужна замена' },
  replacement:        { bg: '#F3E5F5', border: '#E1BEE7', text: '#6A1B9A', label: 'Заменяющий преп.' },
  vacation:           { bg: '#E0F2F1', border: '#B2DFDB', text: '#004D40', label: 'Отпуск' },
  last_lesson:        { bg: '#FFF59D', border: '#FFF176', text: '#F57F17', label: 'Последнее занятие' },
  unpaid:             { bg: '#F5F5DC', border: '#E0E0C0', text: '#5D4037', label: 'Не оплачено' },
  confirmed_paid:     { bg: '#C8E6C9', border: '#A5D6A7', text: '#1B5E20', label: 'Подтв. и оплачено' },
  needs_attention:    { bg: '#81C784', border: '#66BB6A', text: '#1B5E20', label: 'Требует внимания' },
  recruiting:         { bg: '#FFFFFF', border: '#FCA5A5', text: '#DC2626', label: 'Группа в наборе', textClass: 'text-red-600' },
  cancelled:          { bg: '#FFFFFF', border: '#FCA5A5', text: '#DC2626', label: 'Не стартует / перенос', textClass: 'text-red-600 line-through' },
  unavailable:        { bg: '#F5F5F5', border: '#E0E0E0', text: '#9E9E9E', label: 'Недоступен' },
};

export const languageLabels: Record<string, string> = {
  German: 'Немецкий',
  English: 'Английский',
};

type CardColors = { bg: string; border: string; text: string; badge: string };

const ONLINE_GROUP_COLORS: CardColors = {
  bg: '#F1E9FF', border: '#C4B5FD', text: '#5B21B6', badge: '#8B5CF6',
};

const OFFLINE_GROUP_COLORS: CardColors = {
  bg: '#FFFFFF', border: '#D1D5DB', text: '#1F2937', badge: '#9CA3AF',
};

const OFFLINE_CLUB_COLORS: CardColors = {
  bg: '#FFFFFF', border: '#F9A8D4', text: '#9D174D', badge: '#EC4899',
};

const STATUS_CARD_COLORS: Partial<Record<ScheduleStatus, CardColors>> = {
  group_start:       { bg: '#FCE1DB', border: '#E48A78', text: '#7F1D1D', badge: '#DD7E6B' },
  recruiting:        { bg: '#FFFFFF', border: '#FCA5A5', text: '#DC2626', badge: '#EF4444' },
  cancelled:         { bg: '#FFFFFF', border: '#FCA5A5', text: '#DC2626', badge: '#EF4444' },
  needs_replacement: { bg: '#FFF4CC', border: '#F4CF65', text: '#7C4A03', badge: '#EAB308' },
  replacement:       { bg: '#F3DCE8', border: '#D5A6BD', text: '#701A4B', badge: '#C06A96' },
  last_lesson:       { bg: '#FFF200', border: '#D6B900', text: '#4A3B00', badge: '#D6B900' },
  unpaid:            { bg: '#FFF8E1', border: '#E7D7A5', text: '#5D4037', badge: '#C8A951' },
  unavailable:       { bg: '#E5E7EB', border: '#C7CBD1', text: '#6B7280', badge: '#9CA3AF' },
};

export function getScheduleCardColors(
  type: TeacherScheduleItem['type'],
  format: TeacherScheduleItem['format'],
  status: ScheduleStatus,
): CardColors {
  const statusColors = STATUS_CARD_COLORS[status];
  if (statusColors) return statusColors;

  if (type === 'individual') return LESSON_TYPE_COLORS.individual;
  if (type === 'testing' || type === 'trial') return LESSON_TYPE_COLORS.testing;
  if (type === 'club') return format === 'online' ? LESSON_TYPE_COLORS.club : OFFLINE_CLUB_COLORS;
  return format === 'online' ? ONLINE_GROUP_COLORS : OFFLINE_GROUP_COLORS;
}
