import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Student } from '../types';
import type { RealGroup } from '../data/realGroups';
import type { AgeBracket, ContractTemplate, GroupCategory, Lang } from '../data/contractTemplatesStore';
import type { HolidayLookup } from '../data/holidays';
import { renderContractDocx } from './docxTemplate';

const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export function courseTypeToGroupCategory(courseType: string): GroupCategory {
  switch (courseType) {
    // Все английские группы — это мини-группы (2-3 чел.), а не отдельный вид договора;
    // по базе знаний школы это всё ещё "Стандартный" договор.
    case 'mini':
    case 'lesson':
      return 'standard';
    case 'individual':
    case 'trial':
    case 'testing':
      return 'individual';
    case 'intensive':
      return 'intensive';
    case 'phonetics':
    case 'club':
      return 'special';
    default:
      return 'standard';
  }
}

export function getAgeBracket(birthDate?: Date): AgeBracket {
  if (!birthDate) return 'adult';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  if (age < 14) return 'child';
  if (age < 18) return 'teen';
  return 'adult';
}

/**
 * "ru" is treated as a universal document language (usable for any course), since contracts
 * are normally issued in Russian regardless of the language being taught. "de"/"en" lock the
 * template to groups actually teaching that language.
 */
export function languageMatchesGroup(templateLanguage: Lang, groupLanguage: 'German' | 'English'): boolean {
  if (templateLanguage === 'ru') return true;
  if (templateLanguage === 'de') return groupLanguage === 'German';
  if (templateLanguage === 'en') return groupLanguage === 'English';
  return false;
}

export function templateMatches(
  template: ContractTemplate,
  category: GroupCategory,
  bracket: AgeBracket,
  groupLanguage: 'German' | 'English'
): boolean {
  return (
    template.groupCategories.includes(category) &&
    template.ageBrackets.includes(bracket) &&
    languageMatchesGroup(template.language, groupLanguage)
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
//  СУММА ПРОПИСЬЮ
// ============================================================

const ONES_MASC = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const ONES_FEM = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const TEENS = [
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
  'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
];
const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

function pluralRu(n: number, forms: [string, string, string]): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  const mod10 = n % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function threeDigitsToWords(n: number, feminine: boolean): string {
  const words: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds) words.push(HUNDREDS[hundreds]);
  if (rest >= 10 && rest <= 19) {
    words.push(TEENS[rest - 10]);
  } else {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    if (tens) words.push(TENS[tens]);
    if (ones) words.push((feminine ? ONES_FEM : ONES_MASC)[ones]);
  }
  return words.join(' ');
}

/** "24 000" → "двадцать четыре тысячи рублей 00 копеек" — для строки "сумма прописью" в договоре. */
export function amountToWordsRu(amount: number): string {
  const intPart = Math.floor(amount);
  const kopecks = Math.round((amount - intPart) * 100);

  if (intPart === 0) return `Ноль рублей ${String(kopecks).padStart(2, '0')} коп.`;

  const millions = Math.floor(intPart / 1_000_000);
  const thousands = Math.floor((intPart % 1_000_000) / 1000);
  const units = intPart % 1000;

  const parts: string[] = [];
  if (millions) {
    parts.push(threeDigitsToWords(millions, false));
    parts.push(pluralRu(millions, ['миллион', 'миллиона', 'миллионов']));
  }
  if (thousands) {
    parts.push(threeDigitsToWords(thousands, true));
    parts.push(pluralRu(thousands, ['тысяча', 'тысячи', 'тысяч']));
  }
  if (units || (!millions && !thousands)) {
    parts.push(threeDigitsToWords(units, false));
  }
  parts.push(pluralRu(units, ['рубль', 'рубля', 'рублей']));
  parts.push(`${String(kopecks).padStart(2, '0')} коп.`);

  return capitalize(parts.filter(Boolean).join(' '));
}

// ============================================================
//  ТАБЛИЦА ТИРОВ — «Объём курсов и расчасовки» (база знаний)
// ============================================================
//
// Часы в договоре — это не текущие часы группы, а минимум, положенный по
// таблице школы: язык + уровень + тип дня (будни / суббота-утро) + число
// учащихся. Дальше — поправки на исключение В1.1(нем)/В1+1ч(англ), детские
// группы (югенды) и интенсивы.

type DayType = 'weekday' | 'saturday_morning';
type LevelBand = 'low' | 'high' | 'exception';
type HeadcountBand = '2' | '3' | '4-8' | '9-12';

const HOURS_TABLE: Record<DayType, Record<LevelBand, Record<HeadcountBand, number>>> = {
  weekday: {
    low: { '2': 36, '3': 48, '4-8': 60, '9-12': 72 },
    high: { '2': 24, '3': 36, '4-8': 48, '9-12': 48 },
    exception: { '2': 48, '3': 60, '4-8': 60, '9-12': 72 },
  },
  saturday_morning: {
    low: { '2': 35, '3': 50, '4-8': 60, '9-12': 70 },
    high: { '2': 25, '3': 35, '4-8': 50, '9-12': 50 },
    exception: { '2': 48, '3': 60, '4-8': 60, '9-12': 72 },
  },
};

/** Суббота-утро — единственная группа, где действует отдельная таблица (кратно 5); группы по
 * субботам, но с 15:00 и позже, по базе знаний считаются как будние ("Суббота день — см. будни"). */
function getDayType(group: RealGroup): DayType {
  if (group.schedule.length === 0) return 'weekday';
  const allSaturdayMorning = group.schedule.every((s) => {
    const hour = Number(s.startTime.split(':')[0]);
    return s.dayOfWeek === 6 && hour < 15;
  });
  return allSaturdayMorning ? 'saturday_morning' : 'weekday';
}

/** Немецкий В1.1 и английский "В1+ 1ч" стоят особняком с более высоким минимумом часов
 * (у взрослых). Определяем эвристически по уровню и названию группы. */
function getLevelBand(group: RealGroup, isYouth: boolean): LevelBand {
  const level = group.level.toUpperCase().replace(/\s+/g, '');
  const name = group.name.toUpperCase();

  if (!isYouth) {
    const isGermanB11 = group.language === 'German' && level.startsWith('B1.1');
    const isEnglishB1Plus1h = group.language === 'English' && level.startsWith('B1+') && name.includes('1Ч');
    if (isGermanB11 || isEnglishB1Plus1h) return 'exception';
  }

  return /^(B2|C1|C2)/.test(level) ? 'high' : 'low';
}

function getHeadcountBand(count: number): HeadcountBand {
  if (count <= 2) return '2';
  if (count === 3) return '3';
  if (count <= 8) return '4-8';
  return '9-12';
}

export interface CourseHoursResult {
  /** Объём курса для §2.3 — ВСЕГДА минимум на 2 человека для этого языка/уровня/дня. */
  hours: number;
  dayType: DayType;
  levelBand: LevelBand;
  /** Полный текст пункта 3.4 — сколько часов при 3 / 4-8 / (9-12, кроме югендов) учащихся. */
  tiersClause: string;
  /** Условия возврата — свои для субботних и для будних групп. */
  refundTerms: string;
  /** Даты, которые добавятся к графику при выходе группы на 3 человека (для "При кол-ве чел. в группе =3"),
   * сгруппированные по месяцам — как месяц/даты в шаблоне, а не одной строкой с табуляцией. */
  datesIfThree: MonthGroups;
  /** Даты, которые добавятся при выходе на 4 и более человек. */
  datesIfFourPlus: MonthGroups;
  /** Выходные из справочника, выпавшие на дни группы: занятий в них нет. */
  skippedHolidays: { date: Date; name: string }[];
}

/**
 * Считает объём курса (в ак.ч.) для договора. По правилам школы §2.3 всегда фиксирует
 * АБСОЛЮТНЫЙ минимум для языка/уровня/типа дня — тир на 2 человека, — независимо от того,
 * сколько учеников уже реально в группе; рост группы описывает отдельно пункт 3.4.
 * Бонус +3 ак.ч. на уровне B1.2 — только для немецкого, английского не касается.
 */
/** Часы для конкретного числа учащихся (2-12), с поправками на югенд-группы (9-12 сливается
 * с 4-8), бонус B1.2 и потолок интенсивов. */
function hoursForHeadcount(
  table: Record<HeadcountBand, number>,
  count: number,
  isYouth: boolean,
  bonus: number,
  cap: number
): number {
  const band = getHeadcountBand(count);
  const effectiveBand = isYouth && band === '9-12' ? '4-8' : band;
  return Math.min(table[effectiveBand] + bonus, cap);
}

function countLabel(from: number, to: number): string {
  if (from === to) {
    return `${from} ${from <= 4 ? 'человека' : 'человек'}`;
  }
  return `${from}-${to} человек`;
}

/**
 * Пункт 3.4 — всегда начинается с 2 человек и дальше по факту: считаем часы для каждого
 * размера группы от 2 до 12 и схлопываем подряд идущие одинаковые значения в один диапазон
 * (например, для B2-C1 3.4 сводится к "2 / 3 / 4-12", а для исключения B1.1 — к "2 / 3-8 / 9-12"),
 * вместо того чтобы жёстко считать, что тиры всегда "2, 3, 4-8, 9-12".
 */
function buildTiersClause(table: Record<HeadcountBand, number>, isYouth: boolean, bonus: number, cap: number): string {
  const groups: { from: number; to: number; hours: number }[] = [];
  for (let count = 2; count <= 12; count += 1) {
    const hours = hoursForHeadcount(table, count, isYouth, bonus, cap);
    const last = groups[groups.length - 1];
    if (last && last.hours === hours) {
      last.to = count;
    } else {
      groups.push({ from: count, to: count, hours });
    }
  }
  return groups
    .map(
      (g) =>
        `В случае если количество учащихся в группе составляет ${countLabel(g.from, g.to)}, объём курса составляет ${g.hours} академических часов.`
    )
    .join(' ');
}

export function computeCourseHours(
  group: RealGroup,
  ageBracket: AgeBracket,
  isHoliday?: HolidayLookup
): CourseHoursResult {
  const isYouth = ageBracket !== 'adult';
  const dayType = getDayType(group);
  const levelBand = getLevelBand(group, isYouth);
  const table = HOURS_TABLE[dayType][levelBand];
  const isB12 = group.level.toUpperCase().replace(/\s+/g, '').startsWith('B1.2');
  const b12Bonus = !isYouth && group.language === 'German' && isB12 ? 3 : 0;
  const intensiveCap = group.courseType === 'intensive' ? (levelBand === 'high' ? 48 : 60) : Infinity;

  const hours = hoursForHeadcount(table, 2, isYouth, b12Bonus, intensiveCap);
  const threeValue = hoursForHeadcount(table, 3, isYouth, b12Bonus, intensiveCap);
  const fourPlusValue = hoursForHeadcount(table, 4, isYouth, b12Bonus, intensiveCap);

  const tiersClause = buildTiersClause(table, isYouth, b12Bonus, intensiveCap);

  const refundTerms =
    dayType === 'saturday_morning'
      ? 'В субботних группах: 15% стоимости удерживается при отказе после 1-го занятия (до 2-го), 30% — после 2-го занятия (до 3-го).'
      : 'В группах буднего дня: 15% стоимости удерживается при отказе до 3-го занятия, 30% — до 5-го занятия.';

  const perLessonHours = lessonDurationHoursNumber(group);
  const emptyGroups: MonthGroups = { months: [], dateLines: [] };
  const { datesIfThree, datesIfFourPlus } = perLessonHours
    ? computeIncrementalDates(group, perLessonHours, hours, threeValue, fourPlusValue, isHoliday)
    : { datesIfThree: emptyGroups, datesIfFourPlus: emptyGroups };

  return {
    hours,
    dayType,
    levelBand,
    tiersClause,
    refundTerms,
    datesIfThree,
    datesIfFourPlus,
    skippedHolidays: buildLessonSchedule(group, isHoliday).skipped,
  };
}

export interface LessonSchedule {
  /** Дни, когда группа реально занимается, в хронологическом порядке. */
  dates: Date[];
  /** Выпавшие на выходные дни — занятий в них нет, курс на столько же продлевается. */
  skipped: { date: Date; name: string }[];
}

/**
 * График занятий группы. Выходные из справочника не становятся занятиями: оплаченный
 * объём часов от этого не уменьшается, поэтому вместо пропущенного дня курс уезжает на
 * одно занятие дальше, за первоначальную дату окончания.
 */
export function buildLessonSchedule(group: RealGroup, isHoliday?: HolidayLookup): LessonSchedule {
  const daysOfWeek = new Set(group.schedule.map((s) => s.dayOfWeek));
  const dates: Date[] = [];
  const skipped: { date: Date; name: string }[] = [];
  if (daysOfWeek.size === 0) return { dates, skipped };

  const cursor = new Date(group.startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(group.endDate);
  end.setHours(0, 0, 0, 0);

  // Сколько занятий было бы без выходных — столько же должно остаться и с ними.
  let plannedCount = 0;
  const counter = new Date(cursor);
  for (let guard = 0; counter <= end && guard < 400; guard += 1) {
    if (daysOfWeek.has(counter.getDay())) plannedCount += 1;
    counter.setDate(counter.getDate() + 1);
  }

  for (let guard = 0; dates.length < plannedCount && guard < 800; guard += 1) {
    if (daysOfWeek.has(cursor.getDay())) {
      const holidayName = isHoliday?.(cursor) ?? null;
      if (holidayName) {
        skipped.push({ date: new Date(cursor), name: holidayName });
      } else {
        dates.push(new Date(cursor));
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return { dates, skipped };
}

/** Every calendar date the group meets, in chronological order, from start to end of course. */
function flatLessonDates(group: RealGroup, isHoliday?: HolidayLookup): Date[] {
  return buildLessonSchedule(group, isHoliday).dates;
}

export interface MonthGroups {
  /** "Июль 2026" и т.п. — один элемент на месяц, в порядке появления. */
  months: string[];
  /** dateLines[i] — дни месяца months[i] одной строкой ("03, 06, 10"). */
  dateLines: string[];
}

/**
 * Группирует даты по месяцам: `months[i]` пары с `dateLines[i]` — днями этого месяца одной
 * строкой ("03, 06, 10, ..."). Оба массива рендерятся в шаблоне как два столбца одной
 * табличной строки на каждый месяц (Docxtemplater loop), поэтому месяц и числа всегда стоят
 * в своих колонках, а не через табуляцию внутри одного текстового поля.
 */
function groupDatesByMonth(dates: Date[]): MonthGroups {
  const months: string[] = [];
  const dateLines: string[] = [];
  let currentMonthKey = '';
  let currentDays: string[] = [];

  const flush = () => {
    if (currentDays.length) {
      dateLines.push(currentDays.join(', '));
      currentDays = [];
    }
  };

  for (const date of dates) {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (monthKey !== currentMonthKey) {
      flush();
      currentMonthKey = monthKey;
      months.push(capitalize(format(date, 'LLLL', { locale: ru })));
    }
    currentDays.push(format(date, 'dd'));
  }
  flush();

  return { months, dateLines };
}

function lessonDurationHoursNumber(group: RealGroup): number {
  const item = group.schedule[0];
  if (!item) return 0;
  const [sh, sm] = item.startTime.split(':').map(Number);
  const [eh, em] = item.endTime.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? minutes / 45 : 0;
}

function lessonDurationHours(group: RealGroup): string {
  const academicHours = lessonDurationHoursNumber(group);
  if (!academicHours) return '';
  return Number.isInteger(academicHours) ? String(academicHours) : academicHours.toFixed(1);
}

/**
 * Даты, которые физически добавляются к графику занятий, когда группа дорастает до 3 человек,
 * а затем до 4 и более — заполняет красную строку "При кол-ве чел. в группе = ..." в шаблоне,
 * которую иначе admin считает и вписывает от руки.
 */
function computeIncrementalDates(
  group: RealGroup,
  perLessonHours: number,
  baseHours: number,
  threeHours: number,
  fourPlusHours: number,
  isHoliday?: HolidayLookup
): { datesIfThree: MonthGroups; datesIfFourPlus: MonthGroups } {
  const allDates = flatLessonDates(group, isHoliday);
  const lessonsFor = (hours: number) => Math.round(hours / perLessonHours);
  const n2 = lessonsFor(baseHours);
  const n3 = lessonsFor(threeHours);
  const n4 = lessonsFor(fourPlusHours);

  return {
    datesIfThree: groupDatesByMonth(allDates.slice(n2, n3)),
    datesIfFourPlus: groupDatesByMonth(allDates.slice(n3, n4)),
  };
}

export interface GeneratedContractFile {
  blob: Blob;
  fileName: string;
  /** Расчёт часов по таблице тиров — показываем админу, чтобы можно было свериться не открывая файл. */
  summary: CourseHoursResult;
}

/** Builds a filled contract file for one student in one group, using only real, already-known data. */
export function buildContractFileForStudent(
  template: ContractTemplate,
  student: Student,
  group: RealGroup,
  adminName?: string,
  isHoliday?: HolidayLookup
): GeneratedContractFile {
  if (!template.fileBase64) {
    throw new Error('У шаблона нет загруженного файла');
  }

  const ageBracket = getAgeBracket(student.birthDate);
  const courseHours = computeCourseHours(group, ageBracket, isHoliday);

  const values: Record<string, string> = {};
  values.currentDate = format(new Date(), 'dd.MM.yyyy');
  values.studentFIO = student.name;
  values.email = student.email;
  values.phone = student.phone;
  if (student.birthDate) values.studentDate = format(student.birthDate, 'dd.MM.yyyy');
  values.level = student.germanLevel || student.englishLevel || student.currentLevel;
  if (group.price) {
    values.price = `${group.price.toLocaleString('ru-RU')} руб.`;
    values.priceWords = amountToWordsRu(group.price);
  }
  values.volume = String(courseHours.hours);
  values.tiersClause = courseHours.tiersClause;
  values.refundTerms = courseHours.refundTerms;
  const duration = lessonDurationHours(group);
  if (duration) values.duration = duration;
  if (adminName) values.admin = adminName;

  const loopData: Record<string, string[]> = {};
  const needsMonthSchedule = template.loops.includes('months') || template.loops.includes('dates');
  const monthSchedule = needsMonthSchedule ? groupDatesByMonth(flatLessonDates(group, isHoliday)) : null;
  for (const loop of template.loops) {
    if (loop === 'days') {
      loopData.days = group.schedule.map((s) => `${dayNames[s.dayOfWeek]} ${s.startTime}–${s.endTime}`);
    } else if (loop === 'months') {
      loopData.months = monthSchedule?.months ?? [];
    } else if (loop === 'dates') {
      loopData.dates = monthSchedule?.dateLines ?? [];
    } else if (loop === 'monthsThree') {
      loopData.monthsThree = courseHours.datesIfThree.months;
    } else if (loop === 'daysThree') {
      loopData.daysThree = courseHours.datesIfThree.dateLines;
    } else if (loop === 'monthsFourPlus') {
      loopData.monthsFourPlus = courseHours.datesIfFourPlus.months;
    } else if (loop === 'daysFourPlus') {
      loopData.daysFourPlus = courseHours.datesIfFourPlus.dateLines;
    } else {
      loopData[loop] = [];
    }
  }

  const blob = renderContractDocx(template.fileBase64, { ...values, ...loopData });
  const fileName = `${template.fileName.replace(/\.docx$/i, '')}_${student.name.replace(/\s+/g, '_')}.docx`;
  return { blob, fileName, summary: courseHours };
}
