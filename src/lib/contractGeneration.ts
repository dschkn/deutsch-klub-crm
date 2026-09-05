import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Student } from '../types';
import type { RealGroup } from '../data/realGroups';
import type { AgeBracket, ContractTemplate, GroupCategory, Lang } from '../data/contractTemplatesStore';
import { renderContractDocx } from './docxTemplate';

const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export function courseTypeToGroupCategory(courseType: string): GroupCategory {
  switch (courseType) {
    case 'mini':
      return 'mini';
    case 'individual':
    case 'trial':
    case 'testing':
      return 'individual';
    case 'intensive':
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

/**
 * Groups the group's actual lesson dates by month: `months[i]` ("Июль 2026") pairs with
 * `dateLines[i]` — the day numbers of that month's lessons as one comma-separated string
 * ("03, 06, 10, ..."). The two arrays render side by side as a Месяц/Даты table in the template.
 */
function scheduleByMonth(group: RealGroup): { months: string[]; dateLines: string[] } {
  const daysOfWeek = new Set(group.schedule.map((s) => s.dayOfWeek));
  const months: string[] = [];
  const dateLines: string[] = [];
  if (daysOfWeek.size === 0) return { months, dateLines };

  const cursor = new Date(group.startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(group.endDate);
  end.setHours(0, 0, 0, 0);

  let currentMonthKey = '';
  let currentDays: string[] = [];
  let guard = 0;

  const flush = () => {
    if (currentDays.length) {
      dateLines.push(currentDays.join(', '));
      currentDays = [];
    }
  };

  while (cursor <= end && guard < 400) {
    if (daysOfWeek.has(cursor.getDay())) {
      const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      if (monthKey !== currentMonthKey) {
        flush();
        currentMonthKey = monthKey;
        months.push(capitalize(format(cursor, 'LLLL yyyy', { locale: ru })));
      }
      currentDays.push(format(cursor, 'dd'));
    }
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  flush();

  return { months, dateLines };
}

function lessonDurationHours(group: RealGroup): string {
  const item = group.schedule[0];
  if (!item) return '';
  const [sh, sm] = item.startTime.split(':').map(Number);
  const [eh, em] = item.endTime.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) return '';
  const academicHours = minutes / 45;
  return Number.isInteger(academicHours) ? String(academicHours) : academicHours.toFixed(1);
}

export interface GeneratedContractFile {
  blob: Blob;
  fileName: string;
}

/** Builds a filled contract file for one student in one group, using only real, already-known data. */
export function buildContractFileForStudent(
  template: ContractTemplate,
  student: Student,
  group: RealGroup,
  adminName?: string
): GeneratedContractFile {
  if (!template.fileBase64) {
    throw new Error('У шаблона нет загруженного файла');
  }

  const values: Record<string, string> = {};
  values.currentDate = format(new Date(), 'dd.MM.yyyy');
  values.studentFIO = student.name;
  values.email = student.email;
  values.phone = student.phone;
  if (student.birthDate) values.studentDate = format(student.birthDate, 'dd.MM.yyyy');
  values.level = student.germanLevel || student.englishLevel || student.currentLevel;
  if (group.price) values.price = `${group.price.toLocaleString('ru-RU')} руб.`;
  if (group.hours) values.volume = String(group.hours);
  const duration = lessonDurationHours(group);
  if (duration) values.duration = duration;
  if (adminName) values.admin = adminName;

  const loopData: Record<string, string[]> = {};
  const needsMonthSchedule = template.loops.includes('months') || template.loops.includes('dates');
  const monthSchedule = needsMonthSchedule ? scheduleByMonth(group) : null;
  for (const loop of template.loops) {
    if (loop === 'days') {
      loopData.days = group.schedule.map((s) => `${dayNames[s.dayOfWeek]} ${s.startTime}–${s.endTime}`);
    } else if (loop === 'months') {
      loopData.months = monthSchedule?.months ?? [];
    } else if (loop === 'dates') {
      loopData.dates = monthSchedule?.dateLines ?? [];
    } else {
      loopData[loop] = [];
    }
  }

  const blob = renderContractDocx(template.fileBase64, { ...values, ...loopData });
  const fileName = `${template.fileName.replace(/\.docx$/i, '')}_${student.name.replace(/\s+/g, '_')}.docx`;
  return { blob, fileName };
}
