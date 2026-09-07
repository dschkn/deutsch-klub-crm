import { useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useDictionaryValues } from './dictionariesStore';

/**
 * Выходные ведутся в справочнике обычным текстом ("8 марта", "1 января - Новый год"),
 * потому что их заводит администратор, а не разработчик. Этот модуль превращает такую
 * запись в дату, чтобы одни и те же выходные применялись и в расписании, и в расчёте
 * академических часов, и в договоре.
 */
export interface Holiday {
  /** 0-11, как в Date. */
  month: number;
  day: number;
  /** Если год не указан, выходной считается ежегодным ("8 марта" — каждый год). */
  year?: number;
  name: string;
}

const MONTH_STEMS = [
  'январ',
  'феврал',
  'март',
  'апрел',
  'ма',
  'июн',
  'июл',
  'август',
  'сентябр',
  'октябр',
  'ноябр',
  'декабр',
];

/** "мая" → 4, "марта" → 2. Май отдельным случаем: его основа "ма" совпала бы с "март". */
function monthFromWord(word: string): number | null {
  const lower = word.toLowerCase();
  if (/^ма[йя]$/.test(lower)) return 4;
  // Основа + падежное окончание ("январ" + "я"), но не любое слово, начинающееся с основы:
  // иначе "мартобря" сошло бы за март.
  const index = MONTH_STEMS.findIndex(
    (stem, i) => i !== 4 && lower.startsWith(stem) && lower.length <= stem.length + 2,
  );
  return index === -1 ? null : index;
}

function isValidDay(month: number, day: number): boolean {
  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= maxDays[month];
}

/**
 * Разбирает запись справочника. Поддерживает то, как выходные реально записывают:
 * "8 марта", "1 января - Новый год", "23.02", "23.02.2026", "2026-01-07".
 * Возвращает null, если дату распознать не удалось — такая запись просто игнорируется
 * при расчётах, но остаётся в справочнике.
 */
export function parseHoliday(value: string): Holiday | null {
  const raw = value.trim();
  if (!raw) return null;

  // Название — то, что после тире; если тире нет, названием служит вся запись.
  const [datePart, ...nameParts] = raw.split(/\s+[-—–]\s+/);
  const name = nameParts.join(' - ').trim() || raw;
  const date = datePart.trim();

  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const month = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    return month <= 11 && isValidDay(month, day)
      ? { month, day, year: Number(iso[1]), name }
      : null;
  }

  const numeric = date.match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{4}))?$/);
  if (numeric) {
    const month = Number(numeric[2]) - 1;
    const day = Number(numeric[1]);
    return month <= 11 && isValidDay(month, day)
      ? { month, day, year: numeric[3] ? Number(numeric[3]) : undefined, name }
      : null;
  }

  const words = date.match(/^(\d{1,2})\s+([А-Яа-яЁё]+)(?:\s+(\d{4}))?$/);
  if (words) {
    const month = monthFromWord(words[2]);
    const day = Number(words[1]);
    return month !== null && isValidDay(month, day)
      ? { month, day, year: words[3] ? Number(words[3]) : undefined, name }
      : null;
  }

  return null;
}

/**
 * Строка справочника для выбранной в календаре даты — обратная операция к parseHoliday.
 * Ежегодный выходной записывается без года ("8 марта"), разовый — с годом ("23.02.2026"),
 * чтобы он относился только к этой конкретной дате.
 */
export function formatHolidayValue(date: Date, name: string, repeatsAnnually: boolean): string {
  const datePart = repeatsAnnually ? format(date, 'd MMMM', { locale: ru }) : format(date, 'dd.MM.yyyy');
  const trimmedName = name.trim();
  // Без явного "- Название" parseHoliday принимает всю запись за имя, и в расписании рядом
  // с датой занятия повторно печаталась бы сама дата ("12.08 12.08.2026") — вместо этого
  // безымянному выходному даём общую подпись.
  return `${datePart} - ${trimmedName || 'Выходной'}`;
}

/** Дата для предзаполнения календаря при редактировании: год берём из записи или текущий. */
export function holidayToDate(holiday: Holiday, fallbackYear: number): Date {
  return new Date(holiday.year ?? fallbackYear, holiday.month, holiday.day);
}

export type HolidayLookup = (date: Date) => string | null;

/** Возвращает название выходного для даты либо null. Ежегодные выходные (без года) — каждый год. */
export function makeHolidayLookup(holidays: Holiday[]): HolidayLookup {
  const byKey = new Map<string, string>();
  for (const holiday of holidays) {
    const key = `${holiday.year ?? '*'}-${holiday.month}-${holiday.day}`;
    if (!byKey.has(key)) byKey.set(key, holiday.name);
  }
  return (date: Date) => {
    const month = date.getMonth();
    const day = date.getDate();
    return (
      byKey.get(`${date.getFullYear()}-${month}-${day}`) ??
      byKey.get(`*-${month}-${day}`) ??
      null
    );
  };
}

/** Выходные из справочника, уже разобранные в даты. */
export function useHolidays(): Holiday[] {
  const values = useDictionaryValues('holidays');
  return useMemo(
    () => values.map(parseHoliday).filter((h): h is Holiday => h !== null),
    [values.join('|')], // eslint-disable-line react-hooks/exhaustive-deps
  );
}

/**
 * Готовая проверка «этот день — выходной?». Один и тот же источник для расписания,
 * учёта часов и договора.
 */
export function useHolidayLookup(): HolidayLookup {
  const holidays = useHolidays();
  return useMemo(() => makeHolidayLookup(holidays), [holidays]);
}
