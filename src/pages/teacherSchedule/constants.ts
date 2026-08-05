import { ScheduleStatus } from '../../types';

export const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const LESSON_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  lesson:     { bg: '#E8F5E9', border: '#A5D6A7', text: '#1B5E20', badge: '#4CAF50' },
  individual: { bg: '#E3F2FD', border: '#90CAF9', text: '#0D47A1', badge: '#2196F3' },
  testing:    { bg: '#FFF3E0', border: '#FFCC80', text: '#E65100', badge: '#FF9800' },
  trial:      { bg: '#F3E5F5', border: '#CE93D8', text: '#4A148C', badge: '#9C27B0' },
  club:       { bg: '#E0F7FA', border: '#80DEEA', text: '#00695C', badge: '#009688' },
};

export const LESSON_TYPE_LABELS: Record<string, string> = {
  lesson: 'Групповое',
  individual: 'Индивид.',
  testing: 'Тест',
  trial: 'Пробный',
  club: 'Клуб',
};

export const START_HOUR = 8;
export const END_HOUR = 22;
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
  recruiting:         { bg: '#FFFFFF', border: '#E0E0E0', text: '#C62828', label: 'В наборе', textClass: 'text-red-600' },
  cancelled:          { bg: '#FAFAFA', border: '#E0E0E0', text: '#9E9E9E', label: 'Отменено', textClass: 'text-red-500 line-through' },
  unavailable:        { bg: '#F5F5F5', border: '#E0E0E0', text: '#9E9E9E', label: 'Недоступен' },
};

export const languageLabels: Record<string, string> = {
  German: 'Немецкий',
  English: 'Английский',
};
