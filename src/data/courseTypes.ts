import { useMemo } from 'react';
import { useDictionaryValues } from './dictionariesStore';

/**
 * Тип курса хранится в группе кодом, а не названием: от кода зависят расчёт часов и цены
 * (data/realGroups.ts) и вид договора (lib/contractGeneration.ts). Поэтому справочник задаёт
 * то, как тип называется и какие типы вообще предлагать, но сохраняется всегда код.
 */
export const COURSE_TYPE_LABELS: Record<string, string> = {
  group: 'Групповая',
  mini: 'Мини-группа',
  individual: 'Индивидуальная',
  intensive: 'Интенсив',
  club: 'Клуб',
  grammar: 'Грамматика',
  phonetics: 'Фонетика',
  language_course: 'Языковой курс',
  open_lesson: 'Открытый урок',
  lesson: 'Групповое',
  testing: 'Тест',
  trial: 'Пробный + консультация',
  medical: 'Медицинский',
};

/** Значения справочника, за которыми стоит уже известный коду тип курса. */
const DICTIONARY_VALUE_TO_CODE: Record<string, string> = {
  'стандартный': 'group',
  'групповая': 'group',
  'мини': 'mini',
  'мини-группа': 'mini',
  'индивидуальная': 'individual',
  'интенсив': 'intensive',
  'клуб': 'club',
  'разговорный клуб': 'club',
  'грамматика': 'grammar',
  'фонетика': 'phonetics',
  'языковой курс': 'language_course',
  'открытый урок': 'open_lesson',
};

/**
 * Код для значения справочника. Незнакомое значение («Искусство», «7 споров») становится
 * кодом само по себе: расчёты по нему уйдут в значения по умолчанию, что для нового типа
 * курса и правильно.
 */
export function courseTypeCode(dictionaryValue: string): string {
  return DICTIONARY_VALUE_TO_CODE[dictionaryValue.trim().toLowerCase()] || dictionaryValue.trim();
}

export interface CourseTypeOption {
  /** Код, который сохраняется в группе. */
  value: string;
  label: string;
}

/**
 * Типы курса, которых нет в справочнике «Типы спецкурсов», но без которых нельзя: на них
 * завязаны цена интенсива и признак индивидуального занятия. Добавляются, только если
 * справочник их не покрывает.
 */
const SYSTEM_COURSE_TYPES = ['intensive', 'individual', 'language_course'];

/**
 * Список для выпадающего списка «Тип курса»: сначала справочник, затем системные типы,
 * затем — текущее значение группы, если оно не встретилось (иначе поле было бы пустым).
 */
export function useCourseTypeOptions(currentValue?: string): CourseTypeOption[] {
  const dictionaryValues = useDictionaryValues('course_types');
  const key = dictionaryValues.join('|');

  return useMemo(() => {
    const options: CourseTypeOption[] = [];
    const seen = new Set<string>();
    const push = (value: string, label: string) => {
      if (seen.has(value)) return;
      seen.add(value);
      options.push({ value, label });
    };

    for (const dictionaryValue of dictionaryValues) {
      push(courseTypeCode(dictionaryValue), dictionaryValue);
    }
    for (const code of SYSTEM_COURSE_TYPES) {
      push(code, COURSE_TYPE_LABELS[code]);
    }
    if (currentValue) {
      push(currentValue, COURSE_TYPE_LABELS[currentValue] || currentValue);
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, currentValue]);
}

/**
 * Название типа курса для показа. Справочник имеет приоритет: если администратор назвал
 * тип «Стандартный», он не должен видеть «Групповая» в другом углу интерфейса.
 */
export function useCourseTypeLabel(): (code: string) => string {
  const options = useCourseTypeOptions();
  return useMemo(() => {
    const byCode = new Map(options.map((option) => [option.value, option.label]));
    return (code: string) => byCode.get(code) || COURSE_TYPE_LABELS[code] || code;
  }, [options]);
}
